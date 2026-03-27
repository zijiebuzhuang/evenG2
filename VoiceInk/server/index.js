require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const { IflytekRealtimeSTT } = require('./stt-iflytek-realtime');
const { DeepgramRealtimeSTT } = require('./stt-deepgram-realtime');
const { translate } = require('./translate');

const PORT = process.env.WS_PORT || 8080;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// Check if server has credentials configured
const SERVER_HAS_IFLYTEK = !!(process.env.IFLYTEK_APP_ID && process.env.IFLYTEK_API_KEY);
const SERVER_HAS_DEEPGRAM = !!process.env.DEEPGRAM_API_KEY;

const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    // In development, allow all origins
    if (!ALLOWED_ORIGINS.length) return true;

    const origin = info.origin || info.req.headers.origin;
    if (!origin) return false;

    return ALLOWED_ORIGINS.some(allowed => {
      if (allowed === '*') return true;
      return origin === allowed || origin.endsWith(allowed);
    });
  }
});

console.log(`VoiceInk server running on port ${PORT}`);
console.log(`Health check: http://localhost:${PORT}/health`);
if (ALLOWED_ORIGINS.length) {
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
} else {
  console.log('Allowed origins: * (all, dev mode)');
}
console.log(`Server credentials: iFlytek=${SERVER_HAS_IFLYTEK}, Deepgram=${SERVER_HAS_DEEPGRAM}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send capabilities on connect
  ws.send(JSON.stringify({
    type: 'capabilities',
    serverCredentials: SERVER_HAS_IFLYTEK || SERVER_HAS_DEEPGRAM
  }));

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

        // 讯飞走实时 WebSocket — server env takes priority
        if (currentEngine === 'iflytek') {
          const appId = process.env.IFLYTEK_APP_ID || msg.iflytekAppId;
          const apiKey = process.env.IFLYTEK_API_KEY || msg.iflytekApiKey;
          const apiSecret = process.env.IFLYTEK_API_SECRET || msg.iflytekApiSecret || '';
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
          const apiKey = process.env.DEEPGRAM_API_KEY || msg.deepgramApiKey;
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
      } else if (msg.type === 'translate') {
        const { id, text, from, to } = msg;
        if (!text || !from || !to) return;
        translate(text, from, to)
          .then((translated) => {
            ws.send(JSON.stringify({ type: 'translation', id, text: translated }));
          })
          .catch((err) => {
            console.error(`Translation error (id=${id}):`, err.message);
            // Send empty translation so frontend doesn't stay stuck in 'pending'
            ws.send(JSON.stringify({ type: 'translation', id, text: '' }));
          });
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

server.listen(PORT);
