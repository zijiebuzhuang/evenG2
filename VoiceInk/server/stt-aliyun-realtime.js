const WebSocket = require('ws');
const crypto = require('crypto');

const FRAME_SIZE = 1280; // 40ms @ 16kHz 16bit mono
const DASHSCOPE_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';

class AliyunNlsRealtimeSTT {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  startSession() {
    let ready = false;
    let buffer = Buffer.alloc(0);
    let resultCb = null;
    let errorCb = null;
    let finished = false;
    const taskId = crypto.randomUUID();

    const ws = new WebSocket(DASHSCOPE_URL, {
      headers: {
        Authorization: `bearer ${this.apiKey}`,
        'X-DashScope-DataInspection': 'enable',
      },
    });

    ws.on('open', () => {
      console.log('[Aliyun Paraformer] Connected');
      ws.send(JSON.stringify({
        header: {
          action: 'run-task',
          task_id: taskId,
          streaming: 'duplex',
        },
        payload: {
          task_group: 'audio',
          task: 'asr',
          function: 'recognition',
          model: 'paraformer-realtime-v2',
          parameters: {
            format: 'pcm',
            sample_rate: 16000,
            language_hints: ['zh', 'en'],
          },
          input: {},
        },
      }));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const event = msg.header?.event;

        if (event === 'task-started') {
          ready = true;
          flushBuffer();
          return;
        }

        if (event === 'result-generated') {
          const sentence = msg.payload?.output?.sentence;
          if (!sentence?.text) return;
          if (sentence.sentence_end) {
            if (resultCb) resultCb({ type: 'final', text: sentence.text.trim() });
          } else {
            if (resultCb) resultCb({ type: 'partial', text: sentence.text.trim() });
          }
          return;
        }

        if (event === 'task-failed') {
          const err = new Error(msg.header?.error_message || 'Aliyun Paraformer task failed');
          if (errorCb) errorCb(err);
        }
      } catch (e) {
        if (errorCb) errorCb(e);
      }
    });

    ws.on('error', (err) => {
      console.error('[Aliyun Paraformer] WS error:', err.message);
      if (errorCb) errorCb(err);
    });

    ws.on('close', () => {
      console.log('[Aliyun Paraformer] Disconnected');
      ready = false;
    });

    function flushBuffer() {
      while (buffer.length >= FRAME_SIZE) {
        const frame = buffer.subarray(0, FRAME_SIZE);
        buffer = buffer.subarray(FRAME_SIZE);
        if (ws.readyState === WebSocket.OPEN) ws.send(frame);
      }
    }

    return {
      send(pcm) {
        buffer = Buffer.concat([buffer, pcm]);
        if (ready) flushBuffer();
      },
      finish() {
        if (finished) return;
        finished = true;
        if (buffer.length > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(buffer);
          buffer = Buffer.alloc(0);
        }
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            header: { action: 'finish-task', task_id: taskId, streaming: 'duplex' },
            payload: { input: {} },
          }));
        }
      },
      onResult(cb) { resultCb = cb; },
      onError(cb) { errorCb = cb; },
      close() {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      },
    };
  }
}

module.exports = { AliyunNlsRealtimeSTT };
