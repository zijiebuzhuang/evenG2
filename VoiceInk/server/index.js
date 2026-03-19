require('dotenv').config();
const WebSocket = require('ws');
const { IflytekRealtimeSTT } = require('./stt-iflytek-realtime');
const { DeepgramRealtimeSTT } = require('./stt-deepgram-realtime');

const PORT = process.env.WS_PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });
console.log(`VoiceInk server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  let recording = false;

  // Engine selection
  let currentEngine = 'iflytek';

  // Realtime session (both engines now use this)
  let realtimeSession = null;

  ws.on('message', async (data, isBinary) => {
    if (isBinary) {
      if (!recording) return;
      const pcm = Buffer.isBuffer(data) ? data : Buffer.from(data);

      if (realtimeSession) {
        realtimeSession.send(pcm);
      }
      return;
    }

    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'audio_start') {
        recording = true;
        if (msg.engine) currentEngine = msg.engine;

        // 讯飞走实时 WebSocket
        if (currentEngine === 'iflytek') {
          const appId = msg.iflytekAppId || process.env.IFLYTEK_APP_ID;
          const apiKey = msg.iflytekApiKey || process.env.IFLYTEK_API_KEY;
          const apiSecret = msg.iflytekApiSecret || process.env.IFLYTEK_API_SECRET || '';
          console.log(`iFlytek credentials: appId=${appId ? appId.substring(0, 4) + '...' : 'EMPTY'}, apiKey=${apiKey ? apiKey.substring(0, 4) + '...' : 'EMPTY'}, apiSecret=${apiSecret ? apiSecret.substring(0, 4) + '...' : 'EMPTY'}`);
          if (!appId || !apiKey) {
            ws.send(JSON.stringify({ type: 'error', message: 'No iFlytek credentials configured. Add them in Settings.' }));
            recording = false;
            return;
          }
          const rt = new IflytekRealtimeSTT(appId, apiKey, apiSecret);
          realtimeSession = rt.startSession();
          realtimeSession.onResult((result) => {
            if (result.type === 'partial') {
              ws.send(JSON.stringify({ type: 'transcription_partial', text: result.text }));
            } else if (result.type === 'final') {
              if (result.text && result.text.trim()) {
                ws.send(JSON.stringify({ type: 'transcription', text: result.text.trim() }));
              }
            }
          });
          realtimeSession.onError((err) => {
            console.error('iFlytek realtime error:', err.message);
            ws.send(JSON.stringify({ type: 'error', message: err.message }));
          });
        } else if (currentEngine === 'whisper') {
          const apiKey = msg.deepgramApiKey || process.env.DEEPGRAM_API_KEY;
          if (!apiKey) {
            ws.send(JSON.stringify({ type: 'error', message: 'No Deepgram API key configured. Add it in Settings.' }));
            recording = false;
            return;
          }
          const rt = new DeepgramRealtimeSTT(apiKey);
          realtimeSession = rt.startSession();
          realtimeSession.onResult((result) => {
            if (result.type === 'partial') {
              ws.send(JSON.stringify({ type: 'transcription_partial', text: result.text }));
            } else if (result.type === 'final') {
              if (result.text && result.text.trim()) {
                ws.send(JSON.stringify({ type: 'transcription', text: result.text.trim() }));
              }
            }
          });
          realtimeSession.onError((err) => {
            console.error('Deepgram realtime error:', err.message);
            ws.send(JSON.stringify({ type: 'error', message: err.message }));
          });
        }

        ws.send(JSON.stringify({ type: 'status', status: 'recording' }));
        console.log(`Recording started (engine: ${currentEngine})`);
      } else if (msg.type === 'audio_stop') {
        recording = false;
        console.log('Recording stopped');

        if (realtimeSession) {
          realtimeSession.finish();
          const session = realtimeSession;
          setTimeout(() => {
            session.close();
            if (realtimeSession === session) realtimeSession = null;
          }, 3000);
        }

        ws.send(JSON.stringify({ type: 'status', status: 'ready' }));
      }
    } catch (err) {
      console.error('Invalid message:', err.message);
    }
  });

  ws.on('close', () => {
    if (realtimeSession) {
      realtimeSession.close();
      realtimeSession = null;
    }
    console.log('Client disconnected');
  });
});
