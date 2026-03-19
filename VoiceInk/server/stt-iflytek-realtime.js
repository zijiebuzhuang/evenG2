const WebSocket = require('ws');
const crypto = require('crypto');
const tls = require('tls');

const FRAME_SIZE = 1280; // 40ms @ 16kHz 16bit mono

class IflytekRealtimeSTT {
  constructor(appId, apiKey, apiSecret) {
    this.appId = appId;
    this.apiKey = apiKey;       // accessKeyId
    this.apiSecret = apiSecret; // accessKeySecret
  }

  _buildUrl() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absH = pad(Math.floor(Math.abs(offset) / 60));
    const absM = pad(Math.abs(offset) % 60);
    const utc = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${sign}${absH}${absM}`;

    const params = {
      accessKeyId: this.apiKey,
      appId: this.appId,
      uuid: crypto.randomUUID(),
      utc,
      audio_encode: 'pcm_s16le',
      lang: 'autodialect',
      samplerate: '16000',
    };

    const sortedKeys = Object.keys(params).sort();
    const baseString = sortedKeys
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');

    const signature = crypto
      .createHmac('sha1', this.apiSecret)
      .update(baseString)
      .digest('base64');

    params.signature = signature;

    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    return `wss://office-api-ast-dx.iflyaisol.com/ast/communicate/v1?${query}`;
  }

  startSession() {
    const url = this._buildUrl();
    const parsed = new URL(url);

    let ready = false;
    let buffer = Buffer.alloc(0);
    let resultCb = null;
    let errorCb = null;
    let finished = false;
    let sessionId = null;
    let ws = null;
    let closed = false;

    const tlsSocket = tls.connect({
      host: parsed.hostname,
      port: 443,
      ALPNProtocols: ['http/1.1'],
      rejectUnauthorized: false,
    }, () => {
      const path = parsed.pathname + parsed.search;
      const key = crypto.randomBytes(16).toString('base64');
      const req = `GET ${path} HTTP/1.1\r\nHost: ${parsed.hostname}\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: ${key}\r\n\r\n`;
      tlsSocket.write(req);
    });

    let headerBuf = '';
    let upgraded = false;

    tlsSocket.on('data', (chunk) => {
      if (upgraded) return;

      headerBuf += chunk.toString();
      const headerEnd = headerBuf.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;

      const statusLine = headerBuf.split('\r\n')[0];
      const statusMatch = statusLine.match(/HTTP\/\S+\s+(\d+)/);
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 0;

      console.log('[iFlytek RT] HTTP status:', statusCode);

      if (statusCode === 101) {
        upgraded = true;
        tlsSocket.removeAllListeners('data');

        const remaining = headerBuf.slice(headerEnd + 4);
        if (remaining.length > 0) {
          tlsSocket.unshift(Buffer.from(remaining));
        }

        ws = new WebSocket(null, undefined, {
          autoPong: true,
          closeTimeout: 30000,
          maxPayload: 100 * 1024 * 1024,
        });
        // Act as client so Receiver accepts unmasked frames from server
        ws._isServer = false;
        ws.setSocket(tlsSocket, Buffer.alloc(0), {
          maxPayload: 100 * 1024 * 1024,
          generateMask: undefined,
        });

        setupWsHandlers();
      } else {
        const errorHeader = headerBuf.split('\r\n').find(l => l.toLowerCase().startsWith('error:'));
        const errorMsg = errorHeader ? errorHeader.split(':').slice(1).join(':').trim() : `HTTP ${statusCode}`;
        console.error(`[iFlytek RT] Connection rejected: ${statusCode} - ${errorMsg}`);
        if (errorCb) errorCb(new Error(`iFlytek error ${statusCode}: ${errorMsg}`));
        tlsSocket.destroy();
      }
    });

    tlsSocket.on('error', (err) => {
      console.error('[iFlytek RT] TLS error:', err.message);
      if (errorCb) errorCb(err);
    });

    tlsSocket.on('close', () => {});

    function setupWsHandlers() {
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());

          // iFlytek wraps everything in {data: {...}, msg_type: "..."}
          const payload = msg.data || msg;

          if (payload.action === 'started') {
            sessionId = payload.sessionId || null;
            ready = true;
            flushBuffer();
            return;
          }

          if (payload.action === 'error') {
            if (errorCb) errorCb(new Error(`iFlytek error ${payload.code}: ${payload.desc}`));
            return;
          }

          // For result messages, data is already the payload
          const resultData = payload.cn ? payload : msg.data;
          if (!resultData || !resultData.cn) return;

          const st = resultData.cn.st;
          if (!st) return;

          const text = st.rt
            .flatMap(r => r.ws)
            .flatMap(w => w.cw)
            .filter(c => c.wp !== 's')
            .map(c => c.w)
            .join('');

          if (!text.trim()) return;

          if (st.type === '0') {
            if (resultCb) resultCb({ type: 'final', text: text.trim() });
          } else {
            if (resultCb) resultCb({ type: 'partial', text: text.trim() });
          }
        } catch (e) {
          if (errorCb) errorCb(e);
        }
      });

      ws.on('error', (err) => {
        console.error('[iFlytek RT] WS error:', err.message);
        if (errorCb) errorCb(err);
      });

      ws.on('close', () => { ready = false; });

      ready = true;
      flushBuffer();
    }

    function flushBuffer() {
      if (!ws) return;
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
        if (buffer.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
          ws.send(buffer);
          buffer = Buffer.alloc(0);
        }
        if (ws && ws.readyState === WebSocket.OPEN) {
          const endMsg = { end: true };
          if (sessionId) endMsg.sessionId = sessionId;
          ws.send(JSON.stringify(endMsg));
        }
      },
      onResult(cb) { resultCb = cb; },
      onError(cb) { errorCb = cb; },
      close() {
        closed = true;
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
          ws.close();
        }
        if (tlsSocket && !tlsSocket.destroyed) {
          tlsSocket.destroy();
        }
      }
    };
  }
}

module.exports = { IflytekRealtimeSTT };
