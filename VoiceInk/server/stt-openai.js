const fs = require('fs');
const path = require('path');
const { pcmToWav } = require('./wav');
const { execSync } = require('child_process');

const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';

class OpenAISTT {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async transcribe(pcmBuffer) {
    const wavBuffer = pcmToWav(pcmBuffer);
    const tmpPath = path.join('/tmp', `audio-${Date.now()}.wav`);

    try {
      fs.writeFileSync(tmpPath, wavBuffer);

      const result = execSync(
        `curl -s -x ${PROXY_URL} --connect-timeout 10 --max-time 30 ` +
        `https://api.groq.com/openai/v1/audio/transcriptions ` +
        `-H "Authorization: Bearer ${this.apiKey}" ` +
        `-F "file=@${tmpPath}" ` +
        `-F "model=whisper-large-v3" ` +
        `-F "response_format=text"`,
        { encoding: 'utf-8', timeout: 35000 }
      );

      const text = result.trim();

      // Check if response is a JSON error
      if (text.startsWith('{')) {
        const json = JSON.parse(text);
        if (json.error) throw new Error(json.error.message || 'OpenAI API error');
      }

      return text;
    } finally {
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  }
}

module.exports = { OpenAISTT };
