const https = require('https');

function translate(text, from, to) {
  return new Promise((resolve, reject) => {
    // Map internal language codes to language codes expected by MyMemory
    const codeMap = {
      zh: 'zh-CN',
      en: 'en',
      ja: 'ja',
      ko: 'ko'
    };
    const langpair = `${codeMap[from] || from}|${codeMap[to] || to}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.responseData && parsed.responseData.translatedText) {
            resolve(parsed.responseData.translatedText);
          } else {
            reject(new Error('Invalid translation response'));
          }
        } catch (e) {
          reject(new Error('Failed to parse translation response'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { translate };
