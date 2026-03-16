require('dotenv').config();
const WebSocket = require('ws');
const { BaiduSTT } = require('./stt-baidu');

const PORT = process.env.WS_PORT || 8080;

// 停顿检测参数
const SAMPLE_RATE = 16000;
const BYTES_PER_SAMPLE = 2; // 16-bit PCM
const SILENCE_RMS_THRESHOLD = 300; // RMS 低于此值视为静音
const SILENCE_DURATION_MS = 1500; // 连续静音 1.5 秒触发识别
const MAX_SEGMENT_MS = 10000; // 最长 10 秒强制识别

const stt = new BaiduSTT(
  process.env.BAIDU_APP_ID,
  process.env.BAIDU_API_KEY,
  process.env.BAIDU_SECRET_KEY
);

const wss = new WebSocket.Server({ port: PORT });
console.log(`VoiceInk server running on ws://localhost:${PORT}`);

const SENTENCE_DELIMITERS = /[。！？；\n]/;

function calcRMS(pcmBuffer) {
  const samples = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / BYTES_PER_SAMPLE);
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  let audioBuffer = [];
  let audioBytes = 0;
  let recording = false;
  let transcribing = false;

  // 停顿检测状态
  let silenceStart = null; // 静音开始时间
  let segmentStart = null; // 当前片段开始时间
  let checkTimer = null;

  async function transcribeBuffer() {
    if (audioBuffer.length === 0 || transcribing) return;
    transcribing = true;

    const pcm = Buffer.concat(audioBuffer);
    audioBuffer = [];
    audioBytes = 0;
    segmentStart = Date.now();
    console.log(`Transcribing ${pcm.length} bytes...`);

    try {
      const text = await stt.transcribe(pcm);
      console.log(`STT result: "${text}"`);

      if (text && text.trim()) {
        const segments = splitSentences(text.trim());
        for (const sentence of segments.complete) {
          ws.send(JSON.stringify({ type: 'transcription', text: sentence }));
        }
        if (segments.remaining.trim()) {
          ws.send(JSON.stringify({ type: 'transcription', text: segments.remaining.trim() }));
        }
      }
    } catch (err) {
      console.error('STT error:', err.message);
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
    }

    transcribing = false;
  }

  function startDetection() {
    stopDetection();
    segmentStart = Date.now();
    silenceStart = null;
    // 定期检查最大时长兜底
    checkTimer = setInterval(() => {
      if (!recording || audioBuffer.length === 0) return;
      const elapsed = Date.now() - (segmentStart || Date.now());
      if (elapsed >= MAX_SEGMENT_MS) {
        console.log('Max segment duration reached, forcing transcription');
        transcribeBuffer();
      }
    }, 1000);
  }

  function stopDetection() {
    if (checkTimer) { clearInterval(checkTimer); checkTimer = null; }
    silenceStart = null;
    segmentStart = null;
  }

  ws.on('message', async (data, isBinary) => {
    if (isBinary) {
      if (!recording) return;
      const pcm = Buffer.isBuffer(data) ? data : Buffer.from(data);
      audioBuffer.push(pcm);
      audioBytes += pcm.length;

      // 计算当前 chunk 的 RMS
      const rms = calcRMS(pcm);
      const now = Date.now();

      if (rms < SILENCE_RMS_THRESHOLD) {
        // 静音
        if (!silenceStart) silenceStart = now;
        const silenceDuration = now - silenceStart;

        if (silenceDuration >= SILENCE_DURATION_MS && audioBuffer.length > 0 && !transcribing) {
          console.log(`Silence detected (${silenceDuration}ms), triggering transcription`);
          transcribeBuffer();
          silenceStart = null;
        }
      } else {
        // 有声音，重置静音计时
        silenceStart = null;
      }
      return;
    }

    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'audio_start') {
        audioBuffer = [];
        audioBytes = 0;
        recording = true;
        transcribing = false;
        ws.send(JSON.stringify({ type: 'status', status: 'recording' }));
        startDetection();
        console.log('Recording started');
      } else if (msg.type === 'audio_stop') {
        recording = false;
        stopDetection();
        console.log('Recording stopped, remaining chunks:', audioBuffer.length);

        // 识别剩余音频
        await transcribeBuffer();

        ws.send(JSON.stringify({ type: 'status', status: 'ready' }));
      }
    } catch (err) {
      console.error('Invalid message:', err.message);
    }
  });

  ws.on('close', () => {
    stopDetection();
    console.log('Client disconnected');
  });
});

function splitSentences(text) {
  const complete = [];
  let last = 0;

  for (let i = 0; i < text.length; i++) {
    if (SENTENCE_DELIMITERS.test(text[i])) {
      const sentence = text.slice(last, i + 1).trim();
      if (sentence) complete.push(sentence);
      last = i + 1;
    }
  }

  return {
    complete,
    remaining: text.slice(last),
  };
}
