/**
 * Translation module for VoiceInk server.
 *
 * Primary: Google Translate unofficial API (fast, no key required).
 * Fallback: MyMemory free API (~5 000 words/day).
 * Language codes follow ISO 639-1 (zh, en, ja, ko).
 */

const https = require('https');

// Google Translate uses IETF-style subtags for Chinese
const GOOGLE_LANG_MAP = {
  zh: 'zh-CN',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
};

const MYMEMORY_LANG_MAP = {
  zh: 'zh-CN',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
};

/**
 * Make an HTTPS GET request, with optional proxy support.
 * @returns {Promise<string>} response body
 */
function httpsGet(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const options = new URL(url);
    const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;

    const doRequest = (reqOptions) => {
      const req = https.get(reqOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
    };

    if (proxyUrl) {
      try {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        doRequest({ ...options, agent: new HttpsProxyAgent(proxyUrl) });
      } catch {
        doRequest(options);
      }
    } else {
      doRequest(options);
    }
  });
}

/**
 * Google Translate (unofficial, fast, no key).
 */
async function googleTranslate(text, from, to) {
  const sl = GOOGLE_LANG_MAP[from] || from;
  const tl = GOOGLE_LANG_MAP[to] || to;
  const params = new URLSearchParams({
    client: 'gtx',
    sl,
    tl,
    dt: 't',
    q: text,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params.toString()}`;
  const body = await httpsGet(url, 5000);
  const json = JSON.parse(body);
  // Response format: [[["translated","original",...], ...], ...]
  if (Array.isArray(json) && Array.isArray(json[0])) {
    return json[0].map(seg => (seg && seg[0]) || '').join('');
  }
  throw new Error('Unexpected Google Translate response format');
}

/**
 * MyMemory fallback (free, no key, slower).
 */
async function myMemoryTranslate(text, from, to) {
  const srcLang = MYMEMORY_LANG_MAP[from] || from;
  const tgtLang = MYMEMORY_LANG_MAP[to] || to;
  const params = new URLSearchParams({
    q: text,
    langpair: `${srcLang}|${tgtLang}`,
  });
  const url = `https://api.mymemory.translated.net/get?${params.toString()}`;
  const body = await httpsGet(url, 10000);
  const json = JSON.parse(body);
  if (json.responseStatus === 200 && json.responseData && json.responseData.translatedText) {
    return json.responseData.translatedText;
  }
  throw new Error(json.responseData?.translatedText || 'MyMemory translation failed');
}

/**
 * Translate text. Tries Google first, falls back to MyMemory.
 * @param {string} text   – source text
 * @param {string} from   – source language code (zh | en | ja | ko)
 * @param {string} to     – target language code (zh | en | ja | ko)
 * @returns {Promise<string>} translated text
 */
async function translate(text, from, to) {
  if (!text || !text.trim()) return '';
  if (from === to) return text;

  try {
    return await googleTranslate(text, from, to);
  } catch (err) {
    console.error('Google Translate failed, falling back to MyMemory:', err.message);
    return await myMemoryTranslate(text, from, to);
  }
}

module.exports = { translate };
