const AipSpeech = require('baidu-aip-sdk').speech;

class BaiduSTT {
  constructor(appId, apiKey, secretKey) {
    this.client = new AipSpeech(appId, apiKey, secretKey);
  }

  async transcribe(pcmBuffer) {
    const result = await this.client.recognize(pcmBuffer, 'pcm', 16000, {
      dev_pid: 1537, // 普通话 + 简单英文
    });

    if (result.err_no === 0 && result.result && result.result.length > 0) {
      return result.result[0];
    }

    if (result.err_no === 0) return '';
    throw new Error(`Baidu ASR error ${result.err_no}: ${result.err_msg}`);
  }
}

module.exports = { BaiduSTT };
