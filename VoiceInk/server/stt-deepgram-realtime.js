const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');

const FRAME_SIZE = 1280; // 40ms @ 16kHz 16bit mono
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';

class DeepgramRealtimeSTT {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  startSession() {
    let ready = false;
    let buffer = Buffer.alloc(0);
    let resultCb = null;
    let errorCb = null;
    let finished = false;

    const url = 'wss://api.deepgram.com/v1/listen?' +
      'encoding=linear16&sample_rate=16000&channels=1' +
      '&model=nova-2&language=multi' +
      '&interim_results=true&punctuate=true&smart_format=true';

    const wsOpts = {
      headers: { Authorization: `Token ${this.apiKey}` },
    };
    if (PROXY_URL) {
      console.log('[Deepgram RT] Using proxy:', PROXY_URL);
      wsOpts.agent = new HttpsProxyAgent(PROXY_URL);
    }

    const ws = new WebSocket(url, wsOpts);

    ws.on('open', () => {
      console.log('[Deepgram RT] Connected');
      ready = true;
      flushBuffer();
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const alt = msg.channel?.alternatives?.[0];
        if (!alt || !alt.transcript) return;

        const text = alt.transcript.trim();
        if (!text) return;

        if (msg.is_final) {
          if (resultCb) resultCb({ type: 'final', text });
        } else {
          if (resultCb) resultCb({ type: 'partial', text });
        }
      } catch (e) {
        if (errorCb) errorCb(e);
      }
    });

    ws.on('error', (err) => {
      console.error('[Deepgram RT] WS error:', err.message);
      if (errorCb) errorCb(err);
    });

    ws.on('close', () => {
      console.log('[Deepgram RT] Disconnected');
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
          ws.send(JSON.stringify({ type: 'CloseStream' }));
        }
      },
      onResult(cb) { resultCb = cb; },
      onError(cb) { errorCb = cb; },
      close() {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
    };
  }
}

module.exports = { DeepgramRealtimeSTT };
