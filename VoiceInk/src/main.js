import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk';

const BASE = import.meta.env.BASE_URL;
const APP_VERSION = __APP_VERSION__;

// --- i18n ---
const i18n = {
  en: {
    settings: 'Settings',
    display: 'Display',
    glassesDisplay: 'Glasses Display',
    autoClear: 'Auto Clear',
    autoClearTitle: 'Auto Clear',
    autoClearNever: 'Never',
    chineseAsr: 'Chinese ASR',
    englishAsr: 'English ASR',
    general: 'General',
    language: 'Language',
    clearAllRecordings: 'Clear All Recordings',
    about: 'About',
    aboutDesc: 'Chinese STT for Even G2',
    notConnected: 'Not Connected',
    ready: 'Glasses Connected',
    glassesConnected: 'Glasses Connected',
    bridgeReady: 'Bridge Ready',
    newConversation: 'New Conversation',
    startRecording: 'Start Recording',
    stop: 'Stop',
    pause: 'Pause',
    continue: 'Continue',
    noRecordings: 'No recordings',
    iflytekHint: 'Add your iFlytek APPID and API Key in Settings to get started',
    whisperHint: 'Add your Deepgram API Key in Settings to get started',
    goToSettings: 'Go to Settings',
    clearTitle: 'Clear All Recordings?',
    clearMessage: 'This will permanently delete all recording history. This action cannot be undone.',
    cancel: 'Cancel',
    clear: 'Clear',
    confirm: 'Confirm',
    languageTitle: 'Language',
    iflytekSteps: [
      'Go to <a class="link-text" href="https://console.xfyun.cn" target="_blank" rel="noopener">console.xfyun.cn</a> and sign in',
      'Open Console, create an app, then enable Real-time ASR / Real-time Speech Transcription',
      'Copy APPID, API Secret, and API Key into Settings above',
    ],
    deepgramSteps: [
      'Go to <a class="link-text" href="https://console.deepgram.com" target="_blank" rel="noopener">console.deepgram.com</a>',
      'Sign in and create a new API Key',
      'Copy the key and paste it above',
    ],
    chinese: 'Chinese',
    english: 'English',
    lineCount: 'Line Count',
    lineCountTitle: 'Line Count',
    translation: 'Translation',
    translationToggle: 'Translation',
    nativeLanguage: 'Native Language',
    nativeLanguageTitle: 'Native Language',
    nativeLangZh: '中文',
    nativeLangEn: 'English',
    nativeLangJa: '日本語',
    nativeLangKo: '한국어',
    lines: 'lines',
    connecting: 'Connecting…',
    g2TapToRecord: 'Tap to record',
    g2DoubleTapHint: 'Double-tap to exit / pause / stop',
    g2StartupHint: '...',
    g2WaitingForVoice: '...',
    g2Paused: '...',
    aliyun: 'Aliyun',
    aliyunAsr: 'Aliyun ASR',
    aliyunHint: 'Add your Aliyun API Key in Settings to get started',
    aliyunSteps: [
      'Go to <a class="link-text" href="https://bailian.console.aliyun.com" target="_blank" rel="noopener">bailian.console.aliyun.com</a> and sign in',
      'Click your avatar → API-KEY → Create API Key',
      'Copy the key and paste it above',
    ],
    save: 'Save',
    saved: 'Saved',
    useThisAsr: 'Use this ASR',
    inUse: 'In use',
  },
  zh: {
    settings: '设置',
    display: '显示',
    glassesDisplay: '眼镜显示',
    autoClear: '自动清屏',
    autoClearTitle: '自动清屏',
    autoClearNever: '永不',
    chineseAsr: '中文语音识别',
    englishAsr: '英文语音识别',
    general: '通用',
    language: '语言',
    clearAllRecordings: '清空所有录音',
    about: '关于',
    aboutDesc: 'Even G2 中文语音转文字',
    notConnected: '未连接',
    ready: '眼镜已连接',
    glassesConnected: '眼镜已连接',
    bridgeReady: '桥接已就绪',
    newConversation: '新对话',
    startRecording: '开始录音',
    stop: '停止',
    pause: '暂停',
    continue: '继续',
    noRecordings: '暂无录音',
    iflytekHint: '请在设置中添加讯飞 APPID 和 API Key',
    whisperHint: '请在设置中添加 Deepgram API Key',
    goToSettings: '前往设置',
    clearTitle: '清空所有录音？',
    clearMessage: '这将永久删除所有录音记录，此操作无法撤销。',
    cancel: '取消',
    clear: '清空',
    confirm: '确认',
    languageTitle: '语言',
    iflytekSteps: [
      '前往 <a class="link-text" href="https://console.xfyun.cn" target="_blank" rel="noopener">console.xfyun.cn</a> 并登录账号',
      '进入控制台，创建应用，然后开通「语音听写（流式版）」或「实时语音转写」',
      '把 APPID、API Secret 和 API Key 填到上方即可',
    ],
    deepgramSteps: [
      '前往 <a class="link-text" href="https://console.deepgram.com" target="_blank" rel="noopener">console.deepgram.com</a>',
      '登录并创建新的 API Key',
      '复制密钥并粘贴到上方',
    ],
    chinese: '中文',
    english: '英文',
    lineCount: '显示行数',
    lineCountTitle: '显示行数',
    translation: '翻译',
    translationToggle: '翻译',
    nativeLanguage: '母语',
    nativeLanguageTitle: '母语',
    nativeLangZh: '中文',
    nativeLangEn: 'English',
    nativeLangJa: '日本語',
    nativeLangKo: '한국어',
    lines: '行',
    connecting: '连接中…',
    g2TapToRecord: '单击开始录音',
    g2DoubleTapHint: '双击退出 / 暂停 / 结束',
    g2StartupHint: '...',
    g2WaitingForVoice: '...',
    g2Paused: '...',
    aliyun: '阿里云',
    aliyunAsr: '阿里云语音识别',
    aliyunHint: '请在设置中添加阿里云 App Key 和 Access Key',
    aliyunSteps: [
      '前往 <a class="link-text" href="https://bailian.console.aliyun.com" target="_blank" rel="noopener">bailian.console.aliyun.com</a> 并登录账号',
      '点击右上角头像 → API-KEY → 创建 API Key',
      '复制密钥并粘贴到上方即可',
    ],
    save: '保存',
    saved: '已保存',
    useThisAsr: '使用此识别',
    inUse: '使用中',
  },
};

function t(key) {
  return i18n[currentLang]?.[key] || i18n.en[key] || key;
}

// --- WebSocket URL Configuration ---
function getWebSocketUrl() {
  // Production: use environment variable or explicit override
  if (!import.meta.env.DEV) {
    const manualOverride = localStorage.getItem('voiceink_ws_url');
    if (manualOverride) return manualOverride;

    const prodUrl = import.meta.env.VITE_WS_URL;
    if (!prodUrl) {
      console.error('VITE_WS_URL not set in production build. WebSocket will not connect.');
      return '';
    }
    return prodUrl;
  }

  // Development: always prefer local dev server unless explicitly overridden by env
  const devHost = import.meta.env.VITE_DEV_WS_HOST || 'localhost';
  const protocol = typeof window !== 'undefined' && window.location?.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = devHost.includes(':') ? `[${devHost}]` : devHost;
  return `${protocol}//${host}:8080`;
}

let currentLang = localStorage.getItem('voiceink_language') || 'en';

// --- State ---
let bridge = null;
let bridgeReady = false;
let unsubscribeEvenHubEvent = null;
let glassesAudioSeen = false;
let activeAudioSource = 'none';
let ws = null;
let wsConnected = false;
let recordingState = 'stopped'; // 'recording' | 'paused' | 'stopped'
let transcripts = []; // { id, text, offsetMs, translationText, translationStatus }
let transcriptIdCounter = 0;
let recordings = JSON.parse(localStorage.getItem('voiceink_recordings') || '[]');
let wsUrl = getWebSocketUrl();
let activeEngine = 'iflytek';
let activeChineseAsr = 'iflytek'; // tracks which Chinese ASR sub-tab is selected
let reconnectAttempts = 0;
let selectedHistoryDateKey = '';
const MAX_RECONNECT = 10;
let serverCredentials = { iflytek: false, whisper: false, aliyun: false }; // Will be set by server on connect

// Recording timer state
let recordingStartTime = null;
let durationTimer = null;
let elapsedSeconds = 0;
let totalPausedMs = 0;
let pauseStartTime = null;

// Legacy browser mic cleanup
let browserAudioCtx = null;
let browserMicStream = null;
let browserWorkletNode = null;

const visualizerState = {
  rafId: null,
  current: 0,
  target: 0,
  intensity: 0,
  phase: 0,
  active: false,
};

// --- DOM ---
const settingsPage = document.getElementById('settingsPage');
const recordingCard = document.getElementById('recordingCard');
const recordingTitle = document.getElementById('recordingTitle');
const recordingTitleText = document.getElementById('recordingTitleText');
const connectionDot = document.getElementById('connectionDot');
const durationDot = document.getElementById('durationDot');
const durationText = document.getElementById('durationText');
const recordingStartTimeEl = document.getElementById('recordingStartTime');
const recordingVisualizer = document.getElementById('recordingVisualizer');
const visualizerBars = Array.from(document.querySelectorAll('.recording-visualizer-bar'));
const historyDateTabs = document.getElementById('historyDateTabs');
const transcriptContainer = document.getElementById('transcriptContainer');
const transcriptList = document.getElementById('transcriptList');
const transcriptSection = document.getElementById('transcriptSection');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const detailPage = document.getElementById('detailPage');
const detailTitle = document.getElementById('detailTitle');
const aboutVersion = document.getElementById('aboutVersion');
const detailTranscriptList = document.getElementById('detailTranscriptList');
const buttonContainer = document.getElementById('buttonContainer');
const whisperKeyInput = document.getElementById('whisperKeyInput');
const tabBaidu = document.getElementById('tabBaidu');
const tabWhisper = document.getElementById('tabWhisper');
const saveIflytekBtn = document.getElementById('saveIflytekBtn');
const saveDeepgramBtn = document.getElementById('saveDeepgramBtn');
const iflytekAppId = document.getElementById('iflytekAppId');
const iflytekApiKey = document.getElementById('iflytekApiKey');
const iflytekApiSecret = document.getElementById('iflytekApiSecret');
const glassesDisplayToggle = document.getElementById('glassesDisplayToggle');
const autoClearCard = document.getElementById('autoClearCard');
const autoClearValue = document.getElementById('autoClearValue');
const autoClearModal = document.getElementById('autoClearModal');
const autoClearModalClose = document.getElementById('autoClearModalClose');
const autoClearConfirmBtn = document.getElementById('autoClearConfirmBtn');
const autoClearOptions = autoClearModal.querySelectorAll('.modal-option');

const lineCountCard = document.getElementById('lineCountCard');
const lineCountValue = document.getElementById('lineCountValue');
const lineCountModal = document.getElementById('lineCountModal');
const lineCountModalClose = document.getElementById('lineCountModalClose');
const lineCountConfirmBtn = document.getElementById('lineCountConfirmBtn');
const lineCountOptions = lineCountModal.querySelectorAll('.modal-option');

const translationToggle = document.getElementById('translationToggle');
const translationToggleLabel = document.getElementById('translationToggleLabel');
const nativeLanguageCard = document.getElementById('nativeLanguageCard');
const nativeLanguageValue = document.getElementById('nativeLanguageValue');
const nativeLanguageModal = document.getElementById('nativeLanguageModal');
const nativeLanguageModalClose = document.getElementById('nativeLanguageModalClose');
const nativeLanguageConfirmBtn = document.getElementById('nativeLanguageConfirmBtn');
const nativeLanguageOptions = nativeLanguageModal.querySelectorAll('.modal-option');
let glassesDisplayOn = localStorage.getItem('voiceink_glasses_display') !== 'off';
let glassesAutoClearMs = localStorage.getItem('voiceink_glasses_autoclear') || '5000';
let tempAutoClearMs = glassesAutoClearMs;
let g2AutoClearTimer = null;

let glassesLineCount = parseInt(localStorage.getItem('voiceink_glasses_line_count') || '4', 10);
let tempLineCount = glassesLineCount;

let translationEnabled = localStorage.getItem('voiceink_translation_enabled') === 'on';
let nativeLanguage = localStorage.getItem('voiceink_native_language') || 'zh';
let tempNativeLanguage = nativeLanguage;

// --- Toggle Renderer ---
// Renders the official toolkit toggle as inline SVG so track can change color but knob stays white
function renderToggle(isOn) {
  const trackColor = isOn ? 'var(--toggle-track-on)' : 'var(--toggle-track-off)';
  const knobPath = isOn
    ? 'M29.25 19.5H21.75V18H19.5V15.75H18V8.25H19.5V6H21.75V4.5H29.25V6H31.5V8.25H33V15.75H31.5V18H29.25V19.5Z'
    : 'M14.25 19.5H6.75V18H4.5V15.75H3V8.25H4.5V6H6.75V4.5H14.25V6H16.5V8.25H18V15.75H16.5V18H14.25V19.5Z';

  return `<svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30.75 3H33V4.5H34.5V6.75H36V17.25H34.5V19.5H33V21H30.75V22.5H5.25V21H3V19.5H1.5V17.25H0V6.75H1.5V4.5H3V3H5.25V1.5H30.75V3Z" fill="${trackColor}" style="transition: fill 0.2s" />
    <path d="${knobPath}" fill="white" style="transition: d 0.2s" />
  </svg>`;
}

function updateTogglesUI() {
  glassesDisplayToggle.innerHTML = renderToggle(glassesDisplayOn);
  translationToggle.innerHTML = renderToggle(translationEnabled);
}

// --- Input Clear Buttons ---
const inputKeyMap = {
  iflytekAppId: 'voiceink_iflytek_appid',
  iflytekApiKey: 'voiceink_iflytek_apikey',
  iflytekApiSecret: 'voiceink_iflytek_apisecret',
  whisperKeyInput: 'voiceink_deepgram_key',
  aliyunApiKeyInput: 'voiceink_aliyun_apikey',
};
const credentialStorageKeys = Object.values(inputKeyMap);
const appStateStorageKeys = [
  'voiceink_language',
  'voiceink_glasses_display',
  'voiceink_glasses_autoclear',
  'voiceink_glasses_line_count',
  'voiceink_translation_enabled',
  'voiceink_native_language',
  'voiceink_recordings',
];
let credentialSyncPromise = null;
let appStateSyncPromise = null;

function getStoredValue(storageKey) {
  return localStorage.getItem(storageKey) || '';
}

function getStoredJsonValue(storageKey, fallback) {
  const rawValue = getStoredValue(storageKey);
  if (!rawValue) return fallback;

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`Failed to parse ${storageKey} from storage:`, error);
    return fallback;
  }
}

function loadPersistedAppStateFromStorage() {
  currentLang = getStoredValue('voiceink_language') || 'en';
  recordings = getStoredJsonValue('voiceink_recordings', []);
  glassesDisplayOn = getStoredValue('voiceink_glasses_display') !== 'off';
  glassesAutoClearMs = getStoredValue('voiceink_glasses_autoclear') || '5000';
  tempAutoClearMs = glassesAutoClearMs;

  const storedLineCount = parseInt(getStoredValue('voiceink_glasses_line_count') || '4', 10);
  glassesLineCount = Number.isFinite(storedLineCount) ? storedLineCount : 4;
  tempLineCount = glassesLineCount;

  translationEnabled = getStoredValue('voiceink_translation_enabled') === 'on';
  nativeLanguage = getStoredValue('voiceink_native_language') || 'zh';
  tempNativeLanguage = nativeLanguage;
  tempLang = currentLang;
}

function applyPersistedAppState() {
  loadPersistedAppStateFromStorage();
  applyLanguage();
  updateTogglesUI();
  updateDisplaySettingsUI();
  updateSections();
  updateTabs();

  if (recordingState === 'stopped') {
    updateConnectionStatus();
    void updateG2Display();
  }
}

async function persistStoredValue(storageKey, value) {
  const trimmedValue = value.trim();

  if (trimmedValue) {
    localStorage.setItem(storageKey, trimmedValue);
  } else {
    localStorage.removeItem(storageKey);
  }

  if (!bridge?.setLocalStorage) return trimmedValue;

  try {
    await bridge.setLocalStorage(storageKey, trimmedValue);
  } catch (error) {
    console.warn(`Failed to persist ${storageKey} via bridge storage:`, error);
  }

  return trimmedValue;
}

async function syncStoredValueFromBridge(storageKey) {
  const localValue = getStoredValue(storageKey);
  if (!bridge?.getLocalStorage || !bridge?.setLocalStorage) return localValue;

  try {
    const bridgeValue = (await bridge.getLocalStorage(storageKey)) || '';
    if (bridgeValue) {
      if (bridgeValue !== localValue) {
        localStorage.setItem(storageKey, bridgeValue);
      }
      return bridgeValue;
    }

    if (localValue) {
      await bridge.setLocalStorage(storageKey, localValue);
    }
  } catch (error) {
    console.warn(`Failed to sync ${storageKey} with bridge storage:`, error);
  }

  return localValue;
}

async function syncCredentialStorageFromBridge() {
  if (credentialSyncPromise) return credentialSyncPromise;

  credentialSyncPromise = (async () => {
    for (const storageKey of credentialStorageKeys) {
      await syncStoredValueFromBridge(storageKey);
    }
  })();

  try {
    await credentialSyncPromise;
  } finally {
    credentialSyncPromise = null;
  }
}

async function syncAppStateStorageFromBridge() {
  if (appStateSyncPromise) return appStateSyncPromise;

  appStateSyncPromise = (async () => {
    for (const storageKey of appStateStorageKeys) {
      await syncStoredValueFromBridge(storageKey);
    }
  })();

  try {
    await appStateSyncPromise;
  } finally {
    appStateSyncPromise = null;
  }
}

function applySaveButtonState(btn, currentValue, storedValue) {
  if (!btn) return;
  const hasValue = !!currentValue;
  const isSaved = hasValue && currentValue === storedValue;
  btn.textContent = isSaved ? t('saved') : t('save');
  btn.disabled = !hasValue || isSaved;
  btn.classList.toggle('is-saved', isSaved);
}

function updateSaveButtons() {
  if (saveIflytekBtn) {
    const appId = iflytekAppId.value.trim();
    const apiKey = iflytekApiKey.value.trim();
    const apiSecret = iflytekApiSecret.value.trim();
    const hasAll = !!(appId && apiKey && apiSecret);
    const allSaved = hasAll
      && appId === getStoredValue('voiceink_iflytek_appid')
      && apiKey === getStoredValue('voiceink_iflytek_apikey')
      && apiSecret === getStoredValue('voiceink_iflytek_apisecret');
    saveIflytekBtn.textContent = allSaved ? t('saved') : t('save');
    saveIflytekBtn.disabled = !hasAll || allSaved;
    saveIflytekBtn.classList.toggle('is-saved', allSaved);
  }
  const saveAliyunBtn = document.getElementById('saveAliyunBtn');
  if (saveAliyunBtn) {
    const aliyunApiKeyEl = document.getElementById('aliyunApiKeyInput');
    applySaveButtonState(saveAliyunBtn, aliyunApiKeyEl?.value.trim() || '', getStoredValue('voiceink_aliyun_apikey'));
  }
  if (saveDeepgramBtn) {
    applySaveButtonState(saveDeepgramBtn, whisperKeyInput.value.trim(), getStoredValue('voiceink_deepgram_key'));
  }
  updateUseAsrButtons();
}

function updateUseAsrButtons() {
  const hasIflytekCreds = serverCredentials.iflytek || !!(getStoredValue('voiceink_iflytek_appid') && getStoredValue('voiceink_iflytek_apikey') && getStoredValue('voiceink_iflytek_apisecret'));
  const hasAliyunCreds = serverCredentials.aliyun || !!getStoredValue('voiceink_aliyun_apikey');
  const btnIflytek = document.getElementById('useAsrBtn');
  const btnAliyun = document.getElementById('useAsrBtnAliyun');
  if (btnIflytek) {
    const active = activeChineseAsr === 'iflytek';
    btnIflytek.textContent = active ? t('inUse') : t('useThisAsr');
    btnIflytek.disabled = active || !hasIflytekCreds;
    btnIflytek.classList.toggle('in-use', active);
  }
  if (btnAliyun) {
    const active = activeChineseAsr === 'aliyun';
    btnAliyun.textContent = active ? t('inUse') : t('useThisAsr');
    btnAliyun.disabled = active || !hasAliyunCreds;
    btnAliyun.classList.toggle('in-use', active);
  }
}

if (saveIflytekBtn) {
  saveIflytekBtn.addEventListener('click', async () => {
    await Promise.all([
      persistStoredValue('voiceink_iflytek_appid', iflytekAppId.value),
      persistStoredValue('voiceink_iflytek_apikey', iflytekApiKey.value),
      persistStoredValue('voiceink_iflytek_apisecret', iflytekApiSecret.value),
    ]);
    updateSaveButtons();
    if (activeEngine === 'iflytek' && recordingState === 'stopped') renderHistory();
    updateButtons();
  });
}

if (saveDeepgramBtn) {
  saveDeepgramBtn.addEventListener('click', async () => {
    await persistStoredValue('voiceink_deepgram_key', whisperKeyInput.value);
    updateSaveButtons();
    if (activeEngine === 'whisper' && recordingState === 'stopped') renderHistory();
    updateButtons();
  });
}

const saveAliyunBtn = document.getElementById('saveAliyunBtn');
if (saveAliyunBtn) {
  saveAliyunBtn.addEventListener('click', async () => {
    const aliyunApiKeyEl = document.getElementById('aliyunApiKeyInput');
    await persistStoredValue('voiceink_aliyun_apikey', aliyunApiKeyEl.value);
    updateSaveButtons();
    if (activeEngine === 'aliyun' && recordingState === 'stopped') renderHistory();
    updateButtons();
  });
}

document.querySelectorAll('.input-clear').forEach(btn => {
  btn.addEventListener('click', async () => {
    const inputId = btn.dataset.for;
    const input = document.getElementById(inputId);
    if (input) {
      input.value = '';
      const storageKey = inputKeyMap[inputId];
      if (storageKey) await persistStoredValue(storageKey, '');
      updateSaveButtons();
    }
  });
});

Object.entries(inputKeyMap).forEach(([inputId, storageKey]) => {
  const input = document.getElementById(inputId);
  if (!input) {
    console.warn(`Input element not found: ${inputId}`);
    return;
  }
  input.addEventListener('input', () => {
    updateSaveButtons();
  });
  input.addEventListener('change', () => {
    updateSaveButtons();
  });
  input.addEventListener('keyup', () => {
    updateSaveButtons();
  });
});

// Password visibility toggle
document.querySelectorAll('.input-toggle-vis').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.for);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.querySelector('img').src = isPassword ? `${BASE}eye-show.svg` : `${BASE}eye-hide.svg`;
  });
});

glassesDisplayToggle.addEventListener('click', () => {
  glassesDisplayOn = !glassesDisplayOn;
  updateTogglesUI();
  updateDisplaySettingsUI();
  if (!glassesDisplayOn) {
    clearG2AutoClearTimer();
    clearG2StartupHintTimer();
    g2ShowingStartupHint = false;
  } else {
    if (recordingState === 'recording') {
      scheduleG2AutoClear();
    }
    void updateG2Display();
  }
});

// --- Clear History Dialog ---
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const dialogOverlay = document.getElementById('dialogOverlay');
const dialogCancel = document.getElementById('dialogCancel');
const dialogConfirm = document.getElementById('dialogConfirm');

clearHistoryBtn.addEventListener('click', () => {
  dialogOverlay.classList.remove('hidden');
});

dialogCancel.addEventListener('click', () => {
  dialogOverlay.classList.add('hidden');
});

dialogOverlay.addEventListener('click', (e) => {
  if (e.target === dialogOverlay) dialogOverlay.classList.add('hidden');
});

dialogConfirm.addEventListener('click', async () => {
  recordings = [];
  await persistStoredValue('voiceink_recordings', '[]');
  dialogOverlay.classList.add('hidden');
  renderHistory();
});

// --- Language Picker ---
const languageCard = document.getElementById('languageCard');
const languageValue = document.getElementById('languageValue');
const languageModal = document.getElementById('languageModal');
const languageModalClose = document.getElementById('languageModalClose');
const languageConfirmBtn = document.getElementById('languageConfirmBtn');
const languageOptions = languageModal.querySelectorAll('.modal-option');

let tempLang = currentLang;

function formatAutoClearValue(value = glassesAutoClearMs) {
  if (value === 'never') return t('autoClearNever');
  const seconds = Number(value) / 1000;
  return seconds >= 60 ? `${seconds / 60}min` : `${seconds}s`;
}

function updateAutoClearSelection() {
  autoClearOptions.forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.clear === tempAutoClearMs);
  });
}

function clearG2AutoClearTimer() {
  if (g2AutoClearTimer) {
    clearTimeout(g2AutoClearTimer);
    g2AutoClearTimer = null;
  }
}

function scheduleG2AutoClear() {
  clearG2AutoClearTimer();
  if (!glassesDisplayOn || recordingState !== 'recording' || glassesAutoClearMs === 'never') return;
  const delay = Number(glassesAutoClearMs);
  if (!Number.isFinite(delay) || delay <= 0) return;
  g2AutoClearTimer = setTimeout(() => {
    updateG2Display(true);
  }, delay);
}

function formatLineCountValue(count = glassesLineCount) {
  return `${count} ${t('lines')}`;
}

const NATIVE_LANG_LABELS = { zh: 'nativeLangZh', en: 'nativeLangEn', ja: 'nativeLangJa', ko: 'nativeLangKo' };

function formatNativeLanguageValue(lang = nativeLanguage) {
  return t(NATIVE_LANG_LABELS[lang] || 'nativeLangZh');
}

function updateDisplaySettingsUI() {
  autoClearCard.classList.toggle('hidden', !glassesDisplayOn);
  lineCountCard.classList.toggle('hidden', !glassesDisplayOn);
  autoClearValue.textContent = formatAutoClearValue();
  lineCountValue.textContent = formatLineCountValue();
  nativeLanguageCard.classList.toggle('hidden', !translationEnabled);
  nativeLanguageValue.textContent = formatNativeLanguageValue();
}

function applyLanguage() {
  // Settings page
  document.querySelectorAll('.section-title').forEach(el => {
    if (el.textContent === 'Display' || el.textContent === '显示') el.textContent = t('display');
    if (el.textContent === 'Translation' || el.textContent === '翻译') el.textContent = t('translation');
    if (el.textContent === 'Chinese ASR' || el.textContent === '中文语音识别') el.textContent = t('chineseAsr');
    if (el.textContent === 'English ASR' || el.textContent === '英文语音识别') el.textContent = t('englishAsr');
    if (el.textContent === 'Aliyun ASR' || el.textContent === '阿里云语音识别') el.textContent = t('aliyunAsr');
    if (el.textContent === 'General' || el.textContent === '通用') el.textContent = t('general');
    if (el.textContent === 'About' || el.textContent === '关于') el.textContent = t('about');
  });
  document.querySelector('.toggle-label').textContent = t('glassesDisplay');
  document.querySelector('#autoClearCard .settings-card-label').textContent = t('autoClear');
  document.querySelector('#lineCountCard .settings-card-label').textContent = t('lineCount');
  translationToggleLabel.textContent = t('translationToggle');
  document.querySelector('#nativeLanguageCard .settings-card-label').textContent = t('nativeLanguage');
  document.querySelector('#languageCard .settings-card-label').textContent = t('language');
  document.querySelector('#clearHistoryBtn .settings-card-label').textContent = t('clearAllRecordings');
  aboutVersion.textContent = `VoiceInk v${APP_VERSION}`;
  document.querySelector('.about-card .hint').textContent = t('aboutDesc');

  // Tabs
  tabBaidu.textContent = t('chinese');
  tabWhisper.textContent = t('english');

  // Steps hints
  const stepsHints = document.querySelectorAll('.steps-hint');
  if (stepsHints[0]) {
    stepsHints[0].innerHTML = t('iflytekSteps').map((s, i) => `<p>${i + 1}. ${s}</p>`).join('');
  }
  if (stepsHints[1]) {
    stepsHints[1].innerHTML = t('aliyunSteps').map((s, i) => `<p>${i + 1}. ${s}</p>`).join('');
  }
  if (stepsHints[2]) {
    stepsHints[2].innerHTML = t('deepgramSteps').map((s, i) => `<p>${i + 1}. ${s}</p>`).join('');
  }

  // Dialog
  document.querySelector('.dialog-title').textContent = t('clearTitle');
  document.querySelector('.dialog-message').textContent = t('clearMessage');
  dialogCancel.textContent = t('cancel');
  dialogConfirm.textContent = t('clear');

  // Language modal
  document.querySelector('#languageModal .modal-title').textContent = t('languageTitle');
  languageConfirmBtn.textContent = t('confirm');

  // Auto clear modal
  document.querySelector('#autoClearModal .modal-title').textContent = t('autoClearTitle');
  autoClearConfirmBtn.textContent = t('confirm');
  updateAutoClearSelection();

  // Line count modal
  document.querySelector('#lineCountModal .modal-title').textContent = t('lineCountTitle');
  lineCountConfirmBtn.textContent = t('confirm');

  // Native language modal
  document.querySelector('#nativeLanguageModal .modal-title').textContent = t('nativeLanguageTitle');
  nativeLanguageConfirmBtn.textContent = t('confirm');

  // Settings values
  document.getElementById('settingsSheetTitle').textContent = t('settings');
  languageValue.textContent = currentLang === 'zh' ? '中文' : 'English';
  updateDisplaySettingsUI();

  // Update connection status text
  updateConnectionStatus();
  // Update buttons text
  updateButtons();
  // Refresh save / use-asr button labels
  updateSaveButtons();
  // Update history (for empty state text)
  if (recordingState === 'stopped') renderHistory();
}

// Update selected state in modal
function updateModalSelection() {
  languageOptions.forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.lang === tempLang);
  });
}

languageCard.addEventListener('click', () => {
  tempLang = currentLang;
  updateModalSelection();
  languageModal.classList.remove('hidden');
});

languageModalClose.addEventListener('click', () => {
  languageModal.classList.add('hidden');
});

languageModal.addEventListener('click', (e) => {
  if (e.target === languageModal) languageModal.classList.add('hidden');
});

languageOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    tempLang = opt.dataset.lang;
    updateModalSelection();
  });
});

languageConfirmBtn.addEventListener('click', async () => {
  currentLang = tempLang;
  await persistStoredValue('voiceink_language', currentLang);
  applyLanguage();
  languageModal.classList.add('hidden');
});

autoClearCard.addEventListener('click', () => {
  if (!glassesDisplayOn) return;
  tempAutoClearMs = glassesAutoClearMs;
  updateAutoClearSelection();
  autoClearModal.classList.remove('hidden');
});

autoClearModalClose.addEventListener('click', () => {
  autoClearModal.classList.add('hidden');
});

autoClearModal.addEventListener('click', (e) => {
  if (e.target === autoClearModal) autoClearModal.classList.add('hidden');
});

autoClearOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    tempAutoClearMs = opt.dataset.clear;
    updateAutoClearSelection();
  });
});

autoClearConfirmBtn.addEventListener('click', async () => {
  glassesAutoClearMs = tempAutoClearMs;
  await persistStoredValue('voiceink_glasses_autoclear', glassesAutoClearMs);
  autoClearValue.textContent = formatAutoClearValue();
  if (recordingState === 'recording') scheduleG2AutoClear();
  autoClearModal.classList.add('hidden');
});

// --- Line Count Modal ---
function updateLineCountSelection() {
  lineCountOptions.forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.lines === String(tempLineCount));
  });
}

lineCountCard.addEventListener('click', () => {
  if (!glassesDisplayOn) return;
  tempLineCount = glassesLineCount;
  updateLineCountSelection();
  lineCountModal.classList.remove('hidden');
});

lineCountModalClose.addEventListener('click', () => {
  lineCountModal.classList.add('hidden');
});

lineCountModal.addEventListener('click', (e) => {
  if (e.target === lineCountModal) lineCountModal.classList.add('hidden');
});

lineCountOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    tempLineCount = parseInt(opt.dataset.lines, 10);
    updateLineCountSelection();
  });
});

lineCountConfirmBtn.addEventListener('click', async () => {
  glassesLineCount = tempLineCount;
  await persistStoredValue('voiceink_glasses_line_count', String(glassesLineCount));
  lineCountValue.textContent = formatLineCountValue();
  lineCountModal.classList.add('hidden');
});

// --- Translation Toggle ---
translationToggle.addEventListener('click', () => {
  translationEnabled = !translationEnabled;
  updateTogglesUI();
  updateDisplaySettingsUI();
});

// --- Native Language Modal ---
function updateNativeLanguageSelection() {
  nativeLanguageOptions.forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.nlang === tempNativeLanguage);
  });
}

nativeLanguageCard.addEventListener('click', () => {
  if (!translationEnabled) return;
  tempNativeLanguage = nativeLanguage;
  updateNativeLanguageSelection();
  nativeLanguageModal.classList.remove('hidden');
});

nativeLanguageModalClose.addEventListener('click', () => {
  nativeLanguageModal.classList.add('hidden');
});

nativeLanguageModal.addEventListener('click', (e) => {
  if (e.target === nativeLanguageModal) nativeLanguageModal.classList.add('hidden');
});

nativeLanguageOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    tempNativeLanguage = opt.dataset.nlang;
    updateNativeLanguageSelection();
  });
});

nativeLanguageConfirmBtn.addEventListener('click', async () => {
  nativeLanguage = tempNativeLanguage;
  await persistStoredValue('voiceink_native_language', nativeLanguage);
  nativeLanguageValue.textContent = formatNativeLanguageValue();
  nativeLanguageModal.classList.add('hidden');
});

// --- Page Navigation ---
async function closeSettings() {
  settingsPage.classList.add('hidden');
  await Promise.all([
    persistStoredValue('voiceink_glasses_display', glassesDisplayOn ? 'on' : 'off'),
    persistStoredValue('voiceink_glasses_autoclear', glassesAutoClearMs),
    persistStoredValue('voiceink_glasses_line_count', String(glassesLineCount)),
    persistStoredValue('voiceink_translation_enabled', translationEnabled ? 'on' : 'off'),
    persistStoredValue('voiceink_native_language', nativeLanguage),
  ]);
  if (recordingState === 'stopped') renderHistory();
  updateButtons();
}

async function loadCredentialInputs() {
  if (bridgeReady) {
    await syncCredentialStorageFromBridge();
  }

  const deepgramKey = getStoredValue('voiceink_deepgram_key');
  const appId = getStoredValue('voiceink_iflytek_appid');
  const apiKey = getStoredValue('voiceink_iflytek_apikey');
  const apiSecret = getStoredValue('voiceink_iflytek_apisecret');
  const aliyunApiKeyVal = getStoredValue('voiceink_aliyun_apikey');

  console.log('Opening settings, loaded keys:', {
    deepgram: deepgramKey ? '[value]' : '[empty]',
    appId: appId ? '[value]' : '[empty]',
    apiKey: apiKey ? '[value]' : '[empty]',
    apiSecret: apiSecret ? '[value]' : '[empty]',
    aliyunApiKey: aliyunApiKeyVal ? '[value]' : '[empty]',
  });

  whisperKeyInput.value = deepgramKey;
  iflytekAppId.value = appId;
  iflytekApiKey.value = apiKey;
  iflytekApiSecret.value = apiSecret;
  const aliyunApiKeyEl = document.getElementById('aliyunApiKeyInput');
  if (aliyunApiKeyEl) aliyunApiKeyEl.value = aliyunApiKeyVal;
  updateSaveButtons();
}

async function openSettings() {
  settingsPage.classList.remove('hidden');
  await loadCredentialInputs();
  updateTogglesUI();
  updateDisplaySettingsUI();
}

settingsPage.addEventListener('click', (e) => {
  if (e.target === settingsPage) closeSettings();
});

// Detail page
detailPage.addEventListener('click', (e) => {
  if (e.target === detailPage) detailPage.classList.add('hidden');
});

function openRecordingDetail(record) {
  detailTitle.textContent = record.title;
  detailTranscriptList.innerHTML = '';
  record.transcripts.forEach((t) => {
    const div = document.createElement('div');
    div.className = 'transcript-item';
    const ts = document.createElement('span');
    ts.className = 'transcript-timestamp';
    ts.textContent = formatDuration(Math.floor(t.offsetMs / 1000));
    const txt = document.createElement('span');
    txt.className = 'transcript-text';
    txt.textContent = t.text;
    div.appendChild(ts);
    div.appendChild(txt);
    detailTranscriptList.appendChild(div);
  });
  detailPage.classList.remove('hidden');
}

function getRecordingDateKey(record) {
  const date = new Date(record.startTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHistoryDateLabel(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function renderHistoryDateTabs(dateKeys) {
  historyDateTabs.innerHTML = '';
  if (dateKeys.length <= 1) {
    historyDateTabs.style.display = 'none';
    return;
  }
  historyDateTabs.style.display = '';

  dateKeys.forEach((dateKey) => {
    const button = document.createElement('button');
    button.className = 'history-date-tab';
    if (dateKey === selectedHistoryDateKey) button.classList.add('active');
    button.textContent = formatHistoryDateLabel(dateKey);
    button.addEventListener('click', () => {
      selectedHistoryDateKey = dateKey;
      renderHistory();
    });
    historyDateTabs.appendChild(button);
  });
}

async function deleteRecording(id) {
  recordings = recordings.filter(r => r.id !== id);
  await persistStoredValue('voiceink_recordings', JSON.stringify(recordings));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  historyList.innerHTML = '';

  const filtered = recordings.filter(r => (r.engine || 'iflytek') === activeEngine);

  if (filtered.length === 0) {
    historyDateTabs.innerHTML = '';
    historyDateTabs.style.display = 'none';
    container.classList.add('empty');
    if (activeEngine === 'whisper') {
      const hasKey = serverCredentials.whisper || !!getStoredValue('voiceink_deepgram_key');
      historyList.innerHTML = `
        <div class="empty-state">
          <img src="${BASE}nohistory.svg" width="32" height="32">
          <p>${t('noRecordings')}</p>
          ${hasKey ? '' : `<p class="empty-hint">${t('whisperHint')}</p>`}
          ${hasKey ? '' : `<button class="empty-settings-btn" id="emptySettingsBtn">${t('goToSettings')}</button>`}
        </div>`;
      const btn = document.getElementById('emptySettingsBtn');
      if (btn) btn.addEventListener('click', () => openSettings());
    } else if (activeEngine === 'aliyun') {
      const hasKey = serverCredentials.aliyun || !!getStoredValue('voiceink_aliyun_apikey');
      historyList.innerHTML = `
        <div class="empty-state">
          <img src="${BASE}nohistory.svg" width="32" height="32">
          <p>${t('noRecordings')}</p>
          ${hasKey ? '' : `<p class="empty-hint">${t('aliyunHint')}</p>`}
          ${hasKey ? '' : `<button class="empty-settings-btn" id="emptySettingsBtn">${t('goToSettings')}</button>`}
        </div>`;
      const btn = document.getElementById('emptySettingsBtn');
      if (btn) btn.addEventListener('click', () => openSettings());
    } else {
      const hasIflytekKey = serverCredentials.iflytek || !!(getStoredValue('voiceink_iflytek_appid') && getStoredValue('voiceink_iflytek_apikey') && getStoredValue('voiceink_iflytek_apisecret'));
      historyList.innerHTML = `
        <div class="empty-state">
          <img src="${BASE}nohistory.svg" width="32" height="32">
          <p>${t('noRecordings')}</p>
          ${hasIflytekKey ? '' : `<p class="empty-hint">${t('iflytekHint')}</p>`}
          ${hasIflytekKey ? '' : `<button class="empty-settings-btn" id="emptySettingsBtn">${t('goToSettings')}</button>`}
        </div>`;
      const btn = document.getElementById('emptySettingsBtn');
      if (btn) btn.addEventListener('click', () => openSettings());
    }
    return;
  }

  const dateKeys = [...new Set(filtered.map(getRecordingDateKey))].slice(0, 5);
  if (!dateKeys.includes(selectedHistoryDateKey)) {
    selectedHistoryDateKey = dateKeys[0];
  }
  renderHistoryDateTabs(dateKeys);

  const visibleRecords = filtered.filter((record) => getRecordingDateKey(record) === selectedHistoryDateKey);

  container.classList.remove('empty');

  visibleRecords.forEach((record) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'history-item-wrapper';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-delete-btn';
    deleteBtn.innerHTML = `<img src="${BASE}delete.svg" width="24" height="24">`;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteRecording(record.id);
    });

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <img src="${BASE}record.svg" class="history-item-icon" width="24" height="24">
      <div class="history-item-content">
        <div class="history-item-name">${record.title}</div>
        <div class="history-item-date">${formatStartTime(new Date(record.startTime))} · ${formatDuration(record.duration)}</div>
      </div>
      <img src="${BASE}chevronArrow.svg" class="history-item-arrow" width="24" height="24">`;

    // Swipe-to-delete touch handling
    let startX = 0, currentX = 0, swiping = false;
    const DELETE_THRESHOLD = 72;

    item.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      currentX = startX;
      swiping = true;
      item.style.transition = 'none';
    });

    item.addEventListener('touchmove', (e) => {
      if (!swiping) return;
      currentX = e.touches[0].clientX;
      const dx = currentX - startX;
      if (dx < 0) {
        const clamped = Math.max(dx, -DELETE_THRESHOLD);
        item.style.transform = `translateX(${clamped}px)`;
      }
    });

    item.addEventListener('touchend', () => {
      if (!swiping) return;
      swiping = false;
      item.style.transition = 'transform 0.2s ease';
      const dx = currentX - startX;
      if (dx < -DELETE_THRESHOLD / 2) {
        item.style.transform = `translateX(-${DELETE_THRESHOLD}px)`;
      } else {
        item.style.transform = 'translateX(0)';
      }
    });

    item.addEventListener('click', () => {
      const dx = currentX - startX;
      if (Math.abs(dx) < 5) openRecordingDetail(record);
    });

    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(item);
    historyList.appendChild(wrapper);
  });
}

function updateSections() {
  if (recordingState === 'stopped') {
    transcriptSection.style.display = 'none';
    historySection.style.display = '';
    renderHistory();
  } else {
    transcriptSection.style.display = '';
    historySection.style.display = 'none';
  }
}

// --- WebSocket ---
function connectWebSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    ws.close();
  }

  ws = new WebSocket(wsUrl);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    reconnectAttempts = 0;
    wsConnected = true;
    updateConnectionStatus();
  };

  ws.onmessage = (event) => {
    if (typeof event.data !== 'string') return;
    const msg = JSON.parse(event.data);

    if (msg.type === 'capabilities') {
      const creds = msg.serverCredentials;
      if (creds && typeof creds === 'object') {
        serverCredentials = {
          iflytek: !!creds.iflytek,
          whisper: !!(creds.whisper ?? creds.deepgram),
          aliyun: !!creds.aliyun,
        };
      } else {
        const hasAny = !!creds;
        serverCredentials = { iflytek: hasAny, whisper: hasAny };
      }
      updateButtons();
    } else if (msg.type === 'transcription') {
      addTranscript(msg.text);
    } else if (msg.type === 'transcription_partial') {
      updatePartialTranscript(msg.text);
    } else if (msg.type === 'error') {
      console.error('Server error:', msg.message);
    } else if (msg.type === 'translation') {
      const item = transcripts.find(t => t.id === msg.id);
      if (item) {
        item.translationText = msg.text || '';
        item.translationStatus = 'done';
        void updateG2Display();
      }
    }
  };

  ws.onclose = () => {
    wsConnected = false;
    updateConnectionStatus();
    scheduleReconnect();
  };

  ws.onerror = () => ws?.close();
}

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT) return;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
  reconnectAttempts++;
  setTimeout(() => connectWebSocket(), delay);
}

function wsSend(obj) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

function wsSendBinary(data) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(data);
}

// --- Utility Functions ---
function formatDuration(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatStartTime(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${hours}:${minutes}`;
}

function updateDurationDot() {
  durationDot.classList.remove('recording', 'paused');
  if (recordingState === 'recording') {
    durationDot.classList.add('recording');
    durationDot.style.display = '';
    durationText.style.display = '';
  } else if (recordingState === 'paused') {
    durationDot.classList.add('paused');
    durationDot.style.display = '';
    durationText.style.display = '';
  } else {
    durationDot.style.display = 'none';
    durationText.style.display = 'none';
  }
}

function updateRecordingTitle() {
  if (recordingState === 'stopped') return; // handled by updateConnectionStatus
  connectionDot.style.display = 'none';
  if (transcripts.length > 0) {
    const firstText = transcripts[0].text;
    const match = firstText.match(/^[^。，,.\n]+/);
    recordingTitleText.textContent = match ? match[0].slice(0, 20) : firstText.slice(0, 20);
  } else {
    recordingTitleText.textContent = t('newConversation');
  }
}

function startDurationTimer() {
  stopDurationTimer();
  durationTimer = setInterval(() => {
    elapsedSeconds++;
    durationText.textContent = formatDuration(elapsedSeconds);
  }, 1000);
}

function stopDurationTimer() {
  if (durationTimer) { clearInterval(durationTimer); durationTimer = null; }
}

function setVisualizerMode(mode) {
  recordingVisualizer.classList.remove('idle', 'paused');
  if (mode) recordingVisualizer.classList.add(mode);
}

function resetVisualizerBars() {
  visualizerBars.forEach((bar) => {
    bar.style.transform = 'scaleY(0.25)';
  });
}

function setVisualizerSquares() {
  visualizerBars.forEach((bar) => {
    bar.style.transform = 'scaleY(1)';
  });
}

function animateVisualizer() {
  if (!visualizerState.active) {
    visualizerState.rafId = null;
    return;
  }

  const target = recordingState === 'recording' ? visualizerState.target : 0;
  const smoothing = target > visualizerState.current ? 0.18 : 0.08;
  visualizerState.current += (target - visualizerState.current) * smoothing;
  visualizerState.intensity *= recordingState === 'recording' ? 0.94 : 0.86;
  visualizerState.phase += 0.07 + visualizerState.intensity * 0.08;

  const isActiveVoice = visualizerState.current > 0.05 || visualizerState.intensity > 0.05;

  if (!isActiveVoice) {
    setVisualizerMode('idle');
    setVisualizerSquares();
  } else {
    setVisualizerMode('');
    visualizerBars.forEach((bar, index) => {
      const offset = [0.72, 1, 0.82, 0.94, 0.68][index] || 0.8;
      const wave = Math.sin(visualizerState.phase + index * 0.7) * (0.035 + visualizerState.intensity * 0.06);
      const level = Math.max(0.25, Math.min(0.9, 0.25 + visualizerState.current * offset + wave));
      bar.style.transform = `scaleY(${level})`;
    });
  }

  if (recordingState !== 'recording' && visualizerState.current < 0.02) {
    visualizerState.current = 0;
    visualizerState.target = 0;
    visualizerState.intensity = 0;
    visualizerState.active = false;
    resetVisualizerBars();
    recordingVisualizer.classList.remove('active');
    setVisualizerMode('');
    visualizerState.rafId = null;
    return;
  }

  visualizerState.rafId = requestAnimationFrame(animateVisualizer);
}

function ensureVisualizerAnimation() {
  if (visualizerState.rafId !== null) return;
  visualizerState.active = true;
  visualizerState.rafId = requestAnimationFrame(animateVisualizer);
}

function updateRecordingCardUI() {
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const showDisconnected = recordingState === 'stopped' && !wsConnected;

  recordingCard.classList.toggle('recording', isRecording);
  recordingCard.classList.toggle('disconnected', showDisconnected);

  if (isRecording) {
    recordingVisualizer.classList.add('active');
    ensureVisualizerAnimation();
    return;
  }

  visualizerState.target = 0;
  visualizerState.intensity = 0;

  if (isPaused) {
    visualizerState.current = 0;
    visualizerState.active = false;
    if (visualizerState.rafId !== null) {
      cancelAnimationFrame(visualizerState.rafId);
      visualizerState.rafId = null;
    }
    setVisualizerSquares();
    setVisualizerMode('paused');
    recordingVisualizer.classList.add('active');
    return;
  }

  if (recordingState === 'stopped') {
    visualizerState.current = 0;
    visualizerState.active = false;
    if (visualizerState.rafId !== null) {
      cancelAnimationFrame(visualizerState.rafId);
      visualizerState.rafId = null;
    }
    resetVisualizerBars();
    setVisualizerMode('');
    recordingVisualizer.classList.remove('active');
    return;
  }

  if (visualizerState.current > 0.02) {
    recordingVisualizer.classList.add('active');
    ensureVisualizerAnimation();
  } else {
    visualizerState.current = 0;
    visualizerState.active = false;
    if (visualizerState.rafId !== null) {
      cancelAnimationFrame(visualizerState.rafId);
      visualizerState.rafId = null;
    }
    setVisualizerSquares();
    setVisualizerMode('idle');
    recordingVisualizer.classList.add('active');
  }
}

function updateConnectionStatus() {
  if (recordingState !== 'stopped') return;
  // "Ready" requires WebSocket + Bridge; glassesAudioSeen is only for subtitle detail
  const fullyReady = wsConnected && bridgeReady;
  connectionDot.style.display = '';
  connectionDot.classList.remove('connecting');
  connectionDot.classList.toggle('connected', fullyReady);
  recordingTitleText.textContent = fullyReady ? t('ready') : t('notConnected');

  // If fully ready, the title says "Glasses Connected", so we don't need a subtitle saying the same thing.
  // We only show a subtitle if we are partially ready (e.g. bridge is ready but WS is not).
  if (fullyReady) {
    recordingStartTimeEl.textContent = t('bridgeReady');
  } else {
    recordingStartTimeEl.textContent = (bridgeReady && glassesAudioSeen) ? t('glassesConnected') : bridgeReady ? t('bridgeReady') : '';
  }

  durationText.textContent = '';
  updateRecordingCardUI();
}

// Tap the connection card to retry when not connected
recordingCard.querySelector('.recording-card-top').addEventListener('click', () => {
  if (recordingState !== 'stopped') return;
  const fullyReady = wsConnected && bridgeReady;
  if (fullyReady) return; // already connected, nothing to do

  // Show "Connecting…" state
  connectionDot.classList.remove('connected');
  connectionDot.classList.add('connecting');
  recordingTitleText.textContent = t('connecting');
  recordingStartTimeEl.textContent = '';

  // Retry WebSocket
  if (!wsConnected) {
    reconnectAttempts = 0;
    connectWebSocket();
  }

  // Retry bridge
  if (!bridgeReady) {
    waitForEvenAppBridge().then(async (b) => {
      cleanupBridgeState();
      bridge = b;
      bridgeReady = true;
      g2Initialized = false;
      console.log('G2 bridge reconnected');
      await syncCredentialStorageFromBridge();
      if (recordingState === 'stopped') {
        await syncAppStateStorageFromBridge();
        applyPersistedAppState();
      }
      updateConnectionStatus();
      bindBridgeEvents();
      showG2StartupHint();
      try {
        const ready = await ensureG2PageInitialized(true);
        if (ready) scheduleG2StartupHintDismiss();
      } catch (e) { console.log('Create page failed on retry:', e); }
    }).catch(e => {
      console.log('G2 bridge retry failed:', e);
      updateConnectionStatus();
    });
  }
});

function bindBridgeEvents() {
  if (!bridge) return;
  if (unsubscribeEvenHubEvent) {
    unsubscribeEvenHubEvent();
    unsubscribeEvenHubEvent = null;
  }
  unsubscribeEvenHubEvent = bridge.onEvenHubEvent(handleG2Event);
}

function cleanupBridgeState() {
  clearG2AutoClearTimer();
  clearG2StartupHintTimer();
  g2ShowingStartupHint = false;
  activeAudioSource = 'none';
  try {
    bridge?.audioControl?.(false);
  } catch (e) {
    console.error('Failed to disable bridge audio:', e);
  }
  if (unsubscribeEvenHubEvent) {
    unsubscribeEvenHubEvent();
    unsubscribeEvenHubEvent = null;
  }
}

function hasCredentials(engine = activeEngine) {
  if (engine === 'iflytek') {
    return serverCredentials.iflytek || !!(getStoredValue('voiceink_iflytek_appid') && getStoredValue('voiceink_iflytek_apikey') && getStoredValue('voiceink_iflytek_apisecret'));
  }
  if (engine === 'whisper') {
    return serverCredentials.whisper || !!getStoredValue('voiceink_deepgram_key');
  }
  if (engine === 'aliyun') {
    return serverCredentials.aliyun || !!getStoredValue('voiceink_aliyun_apikey');
  }
  return false;
}

function updateButtons() {
  const settingsBtn = `
    <button class="action-button settings-action-btn" id="settingsButton">
      <img src="${BASE}settings.svg" alt="Settings" width="24" height="24">
    </button>`;
  if (recordingState === 'stopped') {
    const disabled = !wsConnected || !hasCredentials();
    buttonContainer.innerHTML = `
      ${settingsBtn}
      <button class="action-button primary" id="recordButton"${disabled ? ' disabled' : ''}>
        <img src="${BASE}start.svg" alt="Start" width="24" height="24">
        <span>${t('startRecording')}</span>
      </button>`;
  } else if (recordingState === 'recording') {
    buttonContainer.innerHTML = `
      <button class="action-button stop" id="stopButton">
        <img src="${BASE}stop.svg" alt="Stop" width="24" height="24">
        <span>${t('stop')}</span>
      </button>
      <button class="action-button secondary" id="pauseButton">
        <img src="${BASE}pause.svg" alt="Pause" width="24" height="24">
        <span>${t('pause')}</span>
      </button>`;
  } else if (recordingState === 'paused') {
    buttonContainer.innerHTML = `
      <button class="action-button stop" id="stopButton">
        <img src="${BASE}stop.svg" alt="Stop" width="24" height="24">
        <span>${t('stop')}</span>
      </button>
      <button class="action-button secondary" id="continueButton">
        <img src="${BASE}continue.svg" alt="Continue" width="24" height="24">
        <span>${t('continue')}</span>
      </button>`;
  }
  // Re-bind events
  const stopBtn = document.getElementById('stopButton');
  const pauseBtn = document.getElementById('pauseButton');
  const continueBtn = document.getElementById('continueButton');
  const startBtn = document.getElementById('recordButton');
  const settingsBtnEl = document.getElementById('settingsButton');
  if (stopBtn) stopBtn.addEventListener('click', () => stopRecording());
  if (pauseBtn) pauseBtn.addEventListener('click', () => pauseRecording());
  if (continueBtn) continueBtn.addEventListener('click', () => resumeRecording());
  if (startBtn) startBtn.addEventListener('click', () => startRecording());
  if (settingsBtnEl) settingsBtnEl.addEventListener('click', () => openSettings());
}

async function saveRecording() {
  const firstText = transcripts[0].text;
  const match = firstText.match(/^[^。，,.\n]+/);
  const title = match ? match[0].slice(0, 20) : firstText.slice(0, 20);

  const record = {
    id: Date.now(),
    title,
    startTime: recordingStartTime,
    duration: elapsedSeconds,
    engine: activeEngine,
    transcripts: [...transcripts],
  };

  recordings.unshift(record);
  if (recordings.length > 50) recordings = recordings.slice(0, 50);
  await persistStoredValue('voiceink_recordings', JSON.stringify(recordings));
}

// --- Audio (three-state) ---
function isGlassesAudioAvailable() {
  return bridgeReady;
}

function resetLegacyBrowserMicState() {
  if (browserWorkletNode) {
    browserWorkletNode.disconnect();
    browserWorkletNode = null;
  }
  if (browserAudioCtx) {
    browserAudioCtx.close();
    browserAudioCtx = null;
  }
  if (browserMicStream) {
    browserMicStream.getTracks().forEach(t => t.stop());
    browserMicStream = null;
  }
}

async function startRecording() {
  if (recordingState !== 'stopped') return;
  if (!wsConnected) {
    console.warn('WebSocket is not connected');
    updateConnectionStatus();
    updateButtons();
    return;
  }
  if (!isGlassesAudioAvailable()) {
    console.warn('Glasses audio is not available');
    updateConnectionStatus();
    return;
  }
  if (!hasCredentials()) {
    updateButtons();
    return;
  }

  recordingState = 'recording';
  activeAudioSource = 'glasses';
  transcripts = [];
  elapsedSeconds = 0;
  totalPausedMs = 0;
  pauseStartTime = null;
  recordingStartTime = Date.now();

  const engine = activeEngine === 'iflytek' ? 'iflytek' : activeEngine;
  const startMsg = { type: 'audio_start', engine };
  if (engine === 'iflytek') {
    startMsg.iflytekAppId = getStoredValue('voiceink_iflytek_appid');
    startMsg.iflytekApiKey = getStoredValue('voiceink_iflytek_apikey');
    startMsg.iflytekApiSecret = getStoredValue('voiceink_iflytek_apisecret');
  } else if (engine === 'whisper') {
    startMsg.deepgramApiKey = getStoredValue('voiceink_deepgram_key');
  } else if (engine === 'aliyun') {
    startMsg.aliyunApiKey = getStoredValue('voiceink_aliyun_apikey');
  }
  wsSend(startMsg);

  if (bridgeReady) {
    bridge.audioControl(true);
  }
  resetLegacyBrowserMicState();

  visualizerState.target = 0;
  visualizerState.intensity = 0;
  updateDurationDot();
  durationText.textContent = '00:00:00';
  recordingStartTimeEl.textContent = formatStartTime(new Date(recordingStartTime));
  updateRecordingTitle();
  renderTranscripts();
  updateButtons();
  updateSections();
  updateRecordingCardUI();
  startDurationTimer();
  updateTabs();

  void updateG2Display();
}

function pauseRecording() {
  if (recordingState !== 'recording') return;
  recordingState = 'paused';
  activeAudioSource = 'none';
  pauseStartTime = Date.now();

  clearG2AutoClearTimer();
  stopDurationTimer();

  if (bridgeReady) {
    bridge.audioControl(false);
  }
  resetLegacyBrowserMicState();

  flushPendingTranslations();
  wsSend({ type: 'audio_stop' });

  updateDurationDot();
  updateButtons();
  updateRecordingCardUI();
  void updateG2Display();
}

async function resumeRecording() {
  if (recordingState !== 'paused') return;
  if (!isGlassesAudioAvailable()) {
    console.warn('Glasses audio is not available');
    pauseStartTime = null;
    stopRecording();
    return;
  }

  recordingState = 'recording';
  activeAudioSource = 'glasses';

  if (pauseStartTime) {
    totalPausedMs += Date.now() - pauseStartTime;
    pauseStartTime = null;
  }

  const engine = activeEngine === 'iflytek' ? 'iflytek' : activeEngine;
  const startMsg = { type: 'audio_start', engine };
  if (engine === 'iflytek') {
    startMsg.iflytekAppId = getStoredValue('voiceink_iflytek_appid');
    startMsg.iflytekApiKey = getStoredValue('voiceink_iflytek_apikey');
    startMsg.iflytekApiSecret = getStoredValue('voiceink_iflytek_apisecret');
  } else if (engine === 'whisper') {
    startMsg.deepgramApiKey = getStoredValue('voiceink_deepgram_key');
  } else if (engine === 'aliyun') {
    startMsg.aliyunApiKey = getStoredValue('voiceink_aliyun_apikey');
  }
  wsSend(startMsg);

  if (bridgeReady) {
    bridge.audioControl(true);
  }
  resetLegacyBrowserMicState();

  updateDurationDot();
  updateButtons();
  updateRecordingCardUI();
  startDurationTimer();

  void updateG2Display();
}

async function stopRecording() {
  if (recordingState === 'stopped') return;

  const wasActive = recordingState === 'recording' || recordingState === 'paused';
  recordingState = 'stopped';
  activeAudioSource = 'none';

  clearG2AutoClearTimer();
  stopDurationTimer();

  if (wasActive) {
    if (bridgeReady) {
      bridge.audioControl(false);
    }
    resetLegacyBrowserMicState();
    flushPendingTranslations();
    wsSend({ type: 'audio_stop' });
  }

  if (transcripts.length > 0) {
    await saveRecording();
  }

  updateDurationDot();
  updateButtons();
  updateSections();
  updateRecordingCardUI();
  updateConnectionStatus();
  updateTabs();
  void updateG2Display();
}

function getPcmBytes(pcm) {
  if (pcm instanceof Uint8Array) return pcm;
  if (ArrayBuffer.isView(pcm)) {
    return new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  }
  return new Uint8Array(pcm);
}

function updateVisualizerMeter(pcm) {
  const bytes = getPcmBytes(pcm);
  const samples = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
  if (!samples.length) return;

  let sumSquares = 0;
  let zeroCrossings = 0;
  let prev = samples[0] / 32768;

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i] / 32768;
    sumSquares += sample * sample;
    if ((sample >= 0 && prev < 0) || (sample < 0 && prev >= 0)) zeroCrossings++;
    prev = sample;
  }

  const rms = Math.sqrt(sumSquares / samples.length);
  const zcr = zeroCrossings / samples.length;
  const energy = Math.min(1, Math.max(0, (rms - 0.015) * 6.5));
  const brightness = energy > 0 ? Math.min(1, Math.max(0, (zcr - 0.04) * 8)) : 0;
  const nextTarget = Math.min(1, energy * 0.9 + brightness * 0.1);

  if (nextTarget < 0.03) {
    visualizerState.target *= 0.82;
    visualizerState.intensity *= 0.84;
    return;
  }

  visualizerState.target = Math.max(nextTarget, visualizerState.target * 0.88);
  visualizerState.intensity = Math.max(brightness, visualizerState.intensity * 0.9);
}

function handleAudioData(pcm) {
  if (activeAudioSource !== 'glasses' || recordingState !== 'recording') return;
  glassesAudioSeen = true;
  const bytes = getPcmBytes(pcm);
  updateVisualizerMeter(bytes);
  wsSendBinary(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

// --- Transcript ---
let lastTranscriptTime = 0;
const MERGE_THRESHOLD_MS = 3500;
const SHORT_FRAGMENT_LENGTH = 12;
const MAX_TRANSCRIPT_SEGMENT_LENGTH = 72;
const SENTENCE_END_RE = /[。！？.!?]$/;

// --- G2 visual line estimation ---
// G2 container: width=536, padding=12 → usable=512px
// Firmware fixed font: CJK ~20 chars/line, Latin ~40 chars/line at 512px.
// We wrap explicitly so multiline text stays stable instead of reflowing the whole paragraph.
const G2_LINE_WIDTH_UNITS = 40;
const G2_SAFE_LINE_WIDTH_UNITS = 38;

function charWidth(ch) {
  const code = ch.codePointAt(0);
  // CJK Unified, CJK Ext, CJK Compat, Katakana, Hiragana, Hangul,
  // CJK Symbols, Fullwidth Forms, CJK Radicals, Bopomofo, Kanbun
  if (
    (code >= 0x2E80 && code <= 0x9FFF) ||
    (code >= 0xF900 && code <= 0xFAFF) ||
    (code >= 0xFE30 && code <= 0xFE4F) ||
    (code >= 0xFF00 && code <= 0xFF60) ||
    (code >= 0xFFE0 && code <= 0xFFE6) ||
    (code >= 0x1F000 && code <= 0x1FAFF) ||
    (code >= 0x20000 && code <= 0x2FA1F) ||
    (code >= 0x30000 && code <= 0x323AF) ||
    (code >= 0xAC00 && code <= 0xD7AF) ||   // Hangul syllables
    (code >= 0x3040 && code <= 0x30FF) ||   // Hiragana + Katakana
    (code >= 0x3000 && code <= 0x303F)      // CJK Symbols & Punctuation
  ) return 2;
  return 1;
}

function isBreakableWhitespace(ch) {
  return /\s/.test(ch);
}

function measureChars(chars) {
  return chars.reduce((sum, ch) => sum + charWidth(ch), 0);
}

function findLastBreakIndex(chars) {
  for (let i = chars.length - 1; i >= 0; i--) {
    if (isBreakableWhitespace(chars[i])) return i + 1;
  }
  return -1;
}

function wrapParagraphForG2(paragraph, maxUnits = G2_SAFE_LINE_WIDTH_UNITS) {
  if (!paragraph) return [''];

  const chars = [...paragraph];
  const lines = [];
  let lineChars = [];
  let lineUnits = 0;
  let lastBreakIdx = -1;

  for (const ch of chars) {
    const width = charWidth(ch);

    if (lineChars.length > 0 && lineUnits + width > maxUnits) {
      if (lastBreakIdx > 0) {
        const head = lineChars.slice(0, lastBreakIdx).join('').trimEnd();
        const tailChars = lineChars.slice(lastBreakIdx).filter(c => !isBreakableWhitespace(c));
        if (head) lines.push(head);
        lineChars = tailChars;
        lineUnits = measureChars(lineChars);
      } else {
        lines.push(lineChars.join('').trimEnd());
        lineChars = [];
        lineUnits = 0;
      }
      lastBreakIdx = findLastBreakIndex(lineChars);
    }

    if (lineChars.length === 0 && isBreakableWhitespace(ch)) continue;

    lineChars.push(ch);
    lineUnits += width;
    if (isBreakableWhitespace(ch)) lastBreakIdx = lineChars.length;
  }

  if (lineChars.length > 0) {
    lines.push(lineChars.join('').trimEnd());
  }

  return lines.filter(line => line.length > 0);
}

function wrapTextForG2(text, maxUnits = G2_SAFE_LINE_WIDTH_UNITS) {
  if (!text) return [];

  return text
    .split('\n')
    .flatMap(paragraph => wrapParagraphForG2(paragraph, maxUnits));
}

function tailTextForG2(text, maxVisualLines) {
  if (!text) return '';
  const wrappedLines = wrapTextForG2(text, G2_SAFE_LINE_WIDTH_UNITS);
  if (wrappedLines.length === 0) return '';
  return wrappedLines.slice(-maxVisualLines).join('\n');
}

/**
 * Join transcript text entries into a continuous flow string.
 * Inserts a space between two entries only when the boundary is Latin-script
 * (i.e. previous char and next char are both narrow / ASCII-like).
 * CJK text does not need inter-entry spacing.
 */
function joinTextsForDisplay(texts) {
  if (texts.length === 0) return '';
  let result = texts[0];
  for (let i = 1; i < texts.length; i++) {
    const prev = result;
    const next = texts[i];
    if (!prev || !next) { result += next; continue; }
    const lastChar = prev[prev.length - 1];
    const firstChar = next[0];
    // Insert space only when both sides are narrow (non-CJK) characters
    if (charWidth(lastChar) === 1 && charWidth(firstChar) === 1 && lastChar !== ' ' && firstChar !== ' ') {
      result += ' ' + next;
    } else {
      result += next;
    }
  }
  return result;
}

// --- Translation ---

/**
 * Detect the actual language of a text string by character composition.
 * Returns 'ja' | 'ko' | 'zh' | 'en'.
 */
function detectTextLanguage(text) {
  let cjk = 0, hiragana = 0, katakana = 0, hangul = 0, latin = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 0x3040 && code <= 0x309F) hiragana++;
    else if (code >= 0x30A0 && code <= 0x30FF) katakana++;
    else if (code >= 0xAC00 && code <= 0xD7AF) hangul++;
    else if (code >= 0x4E00 && code <= 0x9FFF) cjk++;
    else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) latin++;
  }
  if (hiragana + katakana > 0) return 'ja';
  if (hangul > 0) return 'ko';
  if (cjk > latin) return 'zh';
  return 'en';
}

function shouldTranslate() {
  return translationEnabled;
}

let translationDebounceTimer = null;

function requestTranslation(transcriptItem) {
  if (!translationEnabled) return;
  if (transcriptItem.translationStatus === 'done') return;
  const detected = detectTextLanguage(transcriptItem.text);
  if (detected === nativeLanguage) return; // already in native language, skip
  transcriptItem.translationStatus = 'pending';
  wsSend({
    type: 'translate',
    id: transcriptItem.id,
    text: transcriptItem.text,
    from: detected,
    to: nativeLanguage,
  });
}

/**
 * Schedule a debounced translation for the last transcript item.
 * Called after each merge — waits for merging to settle before sending.
 */
function scheduleTranslation(item) {
  if (!translationEnabled) return;
  if (translationDebounceTimer) clearTimeout(translationDebounceTimer);
  translationDebounceTimer = setTimeout(() => {
    translationDebounceTimer = null;
    if (item.translationStatus !== 'done') {
      requestTranslation(item);
    }
  }, 1500); // wait 1.5s after last merge before translating
}

function flushPendingTranslations() {
  if (!translationEnabled) return;
  if (translationDebounceTimer) { clearTimeout(translationDebounceTimer); translationDebounceTimer = null; }
  for (const item of transcripts) {
    if (item.text.trim() && item.translationStatus !== 'done' && item.translationStatus !== 'pending') {
      requestTranslation(item);
    }
  }
}

function addTranscript(text) {
  if (!text || !text.trim()) return;
  const partial = document.getElementById('partialTranscript');
  if (partial) partial.remove();
  const now = Date.now();
  const offsetMs = elapsedSeconds * 1000;

  const trimmed = text.trim();

  // 讯飞经常把上一句的标点粘在下一段开头，先剥离
  const leadingPunctMatch = trimmed.match(/^([，。！？、；：""''（）《》【】…—·,.!?;:'"()\[\]\s]+)/);
  let leadingPunct = '';
  let body = trimmed;
  if (leadingPunctMatch && transcripts.length > 0) {
    leadingPunct = leadingPunctMatch[1];
    body = trimmed.slice(leadingPunct.length);
    transcripts[transcripts.length - 1].text += leadingPunct.trim();
    // Text changed, invalidate previous translation
    transcripts[transcripts.length - 1].translationStatus = null;
    transcripts[transcripts.length - 1].translationText = '';
  }

  if (!body) {
    // 纯标点，已追加到上一条 — re-translate if needed
    const prev = transcripts[transcripts.length - 1];
    if (prev && SENTENCE_END_RE.test(prev.text)) requestTranslation(prev);
    lastTranscriptTime = now;
    updateRecordingTitle();
    renderTranscripts();
    void updateG2Display();
    return;
  }

  // 讯飞实时模式分段过碎，优先把短句和近邻片段并回上一条
  let targetItem;
  if (activeEngine === 'iflytek' && transcripts.length > 0) {
    const previous = transcripts[transcripts.length - 1];
    const withinMergeWindow = (now - lastTranscriptTime) < MERGE_THRESHOLD_MS;
    const previousEndsSentence = SENTENCE_END_RE.test(previous.text);
    const shouldMergeShortFragment = body.length <= SHORT_FRAGMENT_LENGTH;
    const hasRoom = (previous.text.length + body.length) <= MAX_TRANSCRIPT_SEGMENT_LENGTH;

    if ((withinMergeWindow || shouldMergeShortFragment) && (!previousEndsSentence || shouldMergeShortFragment) && hasRoom) {
      previous.text += body;
      // Text changed — schedule re-translation after merge settles
      previous.translationStatus = null;
      previous.translationText = '';
      targetItem = previous;
      scheduleTranslation(previous);
    } else {
      const newItem = { id: ++transcriptIdCounter, text: body, offsetMs, translationText: '', translationStatus: null };
      transcripts.push(newItem);
      targetItem = newItem;
      // Previous item is now finalized, translate it if it hasn't been
      if (shouldTranslate() && previous.translationStatus !== 'done') {
        requestTranslation(previous);
      }
    }
  } else {
    const newItem = { id: ++transcriptIdCounter, text: body, offsetMs, translationText: '', translationStatus: null };
    transcripts.push(newItem);
    targetItem = newItem;
    // Translate previous finalized item if present
    if (transcripts.length > 1) {
      const previous = transcripts[transcripts.length - 2];
      if (shouldTranslate() && previous.translationStatus !== 'done') {
        requestTranslation(previous);
      }
    }
  }

  // If current item ends with sentence punctuation, translate immediately
  if (SENTENCE_END_RE.test(targetItem.text)) {
    if (translationDebounceTimer) { clearTimeout(translationDebounceTimer); translationDebounceTimer = null; }
    requestTranslation(targetItem);
  }

  lastTranscriptTime = now;
  updateRecordingTitle();
  renderTranscripts();
  void updateG2Display();
}

function clearTranscripts() {
  transcripts = [];
  const partial = document.getElementById('partialTranscript');
  if (partial) partial.remove();
  updateRecordingTitle();
  renderTranscripts();
  void updateG2Display();
}

function updatePartialTranscript(text) {
  if (!text || !text.trim()) return;
  let partial = document.getElementById('partialTranscript');
  if (!partial) {
    partial = document.createElement('div');
    partial.id = 'partialTranscript';
    partial.className = 'transcript-item';
    const ts = document.createElement('span');
    ts.className = 'transcript-timestamp';
    ts.textContent = formatDuration(elapsedSeconds);
    const txt = document.createElement('span');
    txt.className = 'transcript-text partial';
    partial.appendChild(ts);
    partial.appendChild(txt);
    transcriptList.appendChild(partial);
  }
  partial.querySelector('.transcript-text').textContent = text;
  transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
  void updateG2Display();
}

function renderTranscripts() {
  transcriptList.innerHTML = '';

  transcripts.forEach((t) => {
    const div = document.createElement('div');
    div.className = 'transcript-item';

    const ts = document.createElement('span');
    ts.className = 'transcript-timestamp';
    ts.textContent = formatDuration(Math.floor(t.offsetMs / 1000));

    const txt = document.createElement('span');
    txt.className = 'transcript-text';
    txt.textContent = t.text;

    div.appendChild(ts);
    div.appendChild(txt);
    transcriptList.appendChild(div);
  });

  // 自动滚动到底部
  transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
}

// --- G2 Display ---
let g2Initialized = false;
let g2StartupHintTimer = null;
let g2ShowingStartupHint = false;

function buildWelcomePage({ showStartupHint = false } = {}) {
  const content = showStartupHint
    ? `VoiceInk\n\n${t('g2StartupHint')}`
    : `VoiceInk\n\n${t('g2TapToRecord')}\n${t('g2DoubleTapHint')}`;
  return {
    containerTotalNum: 1,
    textObject: [{
      xPosition: 20, yPosition: 20, width: 536, height: 248,
      containerID: 1001, containerName: 'welcome',
      content,
      isEventCapture: 1,
      borderWidth: 0, borderColor: 0, borderRadius: 0, paddingLength: 12,
    }]
  };
}

function clearG2StartupHintTimer() {
  if (g2StartupHintTimer) {
    clearTimeout(g2StartupHintTimer);
    g2StartupHintTimer = null;
  }
}

function scheduleG2StartupHintDismiss() {
  clearG2StartupHintTimer();
  g2StartupHintTimer = setTimeout(async () => {
    g2StartupHintTimer = null;
    if (!bridge || !g2Initialized || recordingState !== 'stopped' || !glassesDisplayOn) return;
    if (!g2ShowingStartupHint) return;
    g2ShowingStartupHint = false;
    try {
      await bridge.rebuildPageContainer(buildWelcomePage());
    } catch (e) {
      console.error('G2 startup hint error:', e);
    }
  }, 1200);
}

function showG2StartupHint() {
  if (!glassesDisplayOn) return;
  g2ShowingStartupHint = true;
  scheduleG2StartupHintDismiss();
}

function buildTranscriptDisplay(isCleared = false) {
  const partialText = document.getElementById('partialTranscript')?.querySelector('.transcript-text')?.textContent?.trim() || '';

  if (recordingState === 'paused') {
    return buildG2Container(t('g2Paused'));
  }

  if (isCleared) {
    return buildG2Container(t('g2WaitingForVoice'));
  }

  const maxLines = glassesLineCount;

  if (translationEnabled) {
    // Bilingual mode: foreign on top, native on bottom.
    // When both are present, keep the total visual lines within the selected limit.
    const foreignTexts = transcripts.map(item => item.text.trim()).filter(Boolean);
    if (partialText) foreignTexts.push(partialText);
    const foreignFlow = joinTextsForDisplay(foreignTexts);

    const nativeTexts = transcripts
      .map(item => (item.translationText || '').trim())
      .filter(Boolean);
    const nativeFlow = joinTextsForDisplay(nativeTexts);

    const hasForeign = !!foreignFlow;
    const hasNative = !!nativeFlow;

    if (!hasForeign && !hasNative) {
      return buildG2Container(t('g2WaitingForVoice'));
    }

    if (hasForeign && hasNative) {
      if (maxLines === 1) {
        return buildG2Container(tailTextForG2(nativeFlow, 1));
      }

      if (maxLines === 2) {
        const foreignBody = tailTextForG2(foreignFlow, 1);
        const nativeBody = tailTextForG2(nativeFlow, 1);
        return buildG2Container([foreignBody, nativeBody].filter(Boolean).join('\n'));
      }

      const separatorLines = 1;
      const contentLines = maxLines - separatorLines;
      const foreignMaxLines = Math.ceil(contentLines / 2);
      const nativeMaxLines = Math.floor(contentLines / 2);
      const foreignBody = tailTextForG2(foreignFlow, foreignMaxLines);
      const nativeBody = tailTextForG2(nativeFlow, nativeMaxLines);

      return buildG2Container([foreignBody, '───', nativeBody].filter(Boolean).join('\n'));
    }

    const body = hasNative
      ? tailTextForG2(nativeFlow, maxLines)
      : tailTextForG2(foreignFlow, maxLines);
    return buildG2Container(body || t('g2WaitingForVoice'));
  }

  // Normal mode: concatenate all text into continuous flow, wrap and take last N lines
  const texts = transcripts.map(item => item.text.trim()).filter(Boolean);
  if (partialText) texts.push(partialText);
  const flow = joinTextsForDisplay(texts);
  const body = flow ? tailTextForG2(flow, maxLines) : t('g2WaitingForVoice');
  return buildG2Container(body);
}

function buildG2Container(content) {
  return {
    containerTotalNum: 1,
    textObject: [{
      xPosition: 20, yPosition: 20, width: 536, height: 248,
      containerID: 1001, containerName: 'transcript',
      content,
      isEventCapture: 1,
      borderWidth: 0, borderColor: 0, borderRadius: 0, paddingLength: 12,
    }]
  };
}

async function ensureG2PageInitialized(showStartupHint = false) {
  if (!bridge || !glassesDisplayOn) return false;
  if (g2Initialized) return true;

  const result = await bridge.createStartUpPageContainer(buildWelcomePage({ showStartupHint }));
  if (result === 0 || result === 1) {
    g2Initialized = true;
    if (result === 1) {
      console.log('createStartUpPageContainer returned 1 (startup page already exists)');
    }
    return true;
  }

  console.log('createStartUpPageContainer returned:', result);
  return false;
}

let g2UpdatePending = false;
let g2LastUpdateIsCleared = false;
let g2UpdateTimeout = null;

function updateG2Display(isCleared = false) {
  g2LastUpdateIsCleared = isCleared;
  
  if (g2UpdatePending) return;
  g2UpdatePending = true;
  
  // Throttle updates to max 150ms per frame to avoid choking the Bluetooth bridge
  if (g2UpdateTimeout) clearTimeout(g2UpdateTimeout);
  g2UpdateTimeout = setTimeout(async () => {
    try {
      await _doUpdateG2Display(g2LastUpdateIsCleared);
    } finally {
      g2UpdatePending = false;
    }
  }, 150);
}

async function _doUpdateG2Display(isCleared = false) {
  if (!bridge) {
    console.log('[G2 Debug] updateG2Display skipped: bridge is null');
    return;
  }
  if (!glassesDisplayOn) {
    console.log('[G2 Debug] updateG2Display skipped: glassesDisplayOn is false');
    clearG2AutoClearTimer();
    clearG2StartupHintTimer();
    g2ShowingStartupHint = false;
    return;
  }

  try {
    if (recordingState === 'stopped') {
      clearG2AutoClearTimer();
      if (g2ShowingStartupHint) showG2StartupHint();
      const ready = await ensureG2PageInitialized(g2ShowingStartupHint);
      if (!ready) {
        console.log('[G2 Debug] updateG2Display skipped (stopped): ensureG2PageInitialized returned false');
        return;
      }
      console.log('[G2] Stopped → rebuilding welcome page');
      await bridge.rebuildPageContainer(buildWelcomePage({ showStartupHint: g2ShowingStartupHint }));
      if (g2ShowingStartupHint) scheduleG2StartupHintDismiss();
      return;
    }

    clearG2StartupHintTimer();
    g2ShowingStartupHint = false;
    const ready = await ensureG2PageInitialized();
    if (!ready) {
      console.log('[G2 Debug] updateG2Display skipped (recording): ensureG2PageInitialized returned false');
      return;
    }
    
    // Skip sending empty page if we're not actually cleared
    const displayData = buildTranscriptDisplay(isCleared);
    console.log('[G2 Debug] Calling rebuildPageContainer with displayData:', JSON.stringify(displayData.textObject[0].content));
    await bridge.rebuildPageContainer(displayData);
    console.log('[G2 Debug] rebuildPageContainer success');
    
    if (!isCleared) scheduleG2AutoClear();
  } catch (e) {
    g2Initialized = false;
    console.error('[G2 Debug] G2 display error:', e);
  }
}

// --- G2 Events ---
function handleG2Event(event) {
  if (event.audioEvent?.audioPcm) {
    glassesAudioSeen = true;
    updateConnectionStatus();
    handleAudioData(event.audioEvent.audioPcm);
    return;
  }

  const ev = event.textEvent || event.listEvent || event.sysEvent;
  if (!ev) return;

  // 解析点击类型（兼容 SDK eventType 归一化 bug：0 → undefined）
  const raw = ev.eventType;
  let isClick = (raw === 0 || raw === undefined);
  let isDoubleClick = (raw === 3);
  if (typeof raw === 'string') {
    const v = raw.toUpperCase();
    if (v.includes('DOUBLE')) { isDoubleClick = true; isClick = false; }
    else if (v.includes('CLICK')) { isClick = true; }
  }

  // 单击：开始 / 恢复
  if (isClick) {
    if (recordingState === 'stopped') startRecording();
    else if (recordingState === 'paused') resumeRecording();
  }
  // 双击：根页面弹退出确认；录音中暂停；暂停时结束
  if (isDoubleClick) {
    if (recordingState === 'stopped') {
      bridge?.shutDownPageContainer?.(1).catch((e) => {
        console.error('Failed to show exit dialog:', e);
      });
    } else if (recordingState === 'recording') {
      pauseRecording();
    } else if (recordingState === 'paused') {
      stopRecording();
    }
  }
}

// --- Tab Switching ---
function updateTabs() {
  const isActive = recordingState !== 'stopped';
  if (isActive) {
    [tabBaidu, tabWhisper].forEach(tab => {
      if (!tab.classList.contains('active')) tab.classList.add('disabled');
    });
  } else {
    tabBaidu.classList.remove('disabled');
    tabWhisper.classList.remove('disabled');
  }
}

tabBaidu.addEventListener('click', () => {
  if (tabBaidu.classList.contains('disabled')) return;
  tabBaidu.classList.add('active');
  tabWhisper.classList.remove('active');
  activeEngine = activeChineseAsr;
  if (recordingState === 'stopped') { renderHistory(); updateButtons(); }
});

tabWhisper.addEventListener('click', () => {
  if (tabWhisper.classList.contains('disabled')) return;
  tabWhisper.classList.add('active');
  tabBaidu.classList.remove('active');
  activeEngine = 'whisper';
  if (recordingState === 'stopped') { renderHistory(); updateButtons(); }
});

// --- Chinese ASR sub-tabs ---
const subTabIflytek = document.getElementById('subTabIflytek');
const subTabAliyun = document.getElementById('subTabAliyun');
const iflytekPanel = document.getElementById('iflytekPanel');
const aliyunPanel = document.getElementById('aliyunPanel');
const useAsrBtn = document.getElementById('useAsrBtn');

if (subTabIflytek) {
  subTabIflytek.addEventListener('click', () => {
    activeChineseAsr = 'iflytek';
    subTabIflytek.classList.add('active');
    subTabAliyun.classList.remove('active');
    iflytekPanel.classList.remove('hidden');
    aliyunPanel.classList.add('hidden');
    if (tabBaidu.classList.contains('active')) { activeEngine = 'iflytek'; updateButtons(); renderHistory(); }
    updateUseAsrButtons();
  });
}

if (subTabAliyun) {
  subTabAliyun.addEventListener('click', () => {
    activeChineseAsr = 'aliyun';
    subTabAliyun.classList.add('active');
    subTabIflytek.classList.remove('active');
    aliyunPanel.classList.remove('hidden');
    iflytekPanel.classList.add('hidden');
    if (tabBaidu.classList.contains('active')) { activeEngine = 'aliyun'; updateButtons(); renderHistory(); }
    updateUseAsrButtons();
  });
}

if (useAsrBtn) {
  useAsrBtn.addEventListener('click', () => {
    activeChineseAsr = 'iflytek';
    if (tabBaidu.classList.contains('active')) { activeEngine = 'iflytek'; updateButtons(); renderHistory(); }
    updateUseAsrButtons();
  });
}

const useAsrBtnAliyun = document.getElementById('useAsrBtnAliyun');
if (useAsrBtnAliyun) {
  useAsrBtnAliyun.addEventListener('click', () => {
    activeChineseAsr = 'aliyun';
    if (tabBaidu.classList.contains('active')) { activeEngine = 'aliyun'; updateButtons(); renderHistory(); }
    updateUseAsrButtons();
  });
}

// --- Init ---
// WebSocket 和 G2 bridge 并行初始化，互不阻塞
loadPersistedAppStateFromStorage();
try {
  applyLanguage();
} catch (e) {
  console.error('Initial applyLanguage failed:', e);
}
updateTogglesUI();
updateDurationDot();
updateRecordingCardUI();
updateSections();
updateButtons();
updateConnectionStatus();
connectWebSocket();

waitForEvenAppBridge().then(async (b) => {
  cleanupBridgeState();
  bridge = b;
  bridgeReady = true;
  console.log('G2 bridge initialized');
  await syncCredentialStorageFromBridge();
  if (recordingState === 'stopped') {
    await syncAppStateStorageFromBridge();
    applyPersistedAppState();
  }
  updateConnectionStatus();
  bindBridgeEvents();
  showG2StartupHint();

  // 尝试创建页面，失败则延迟重试
  async function tryCreatePage(retries) {
    try {
      const ready = await ensureG2PageInitialized(true);
      console.log('createStartUpPageContainer result:', ready ? 0 : 'retry');
      if (ready) {
        scheduleG2StartupHintDismiss();
        console.log('G2 page created');
      } else if (retries > 0) {
        setTimeout(() => tryCreatePage(retries - 1), 1000);
      }
    } catch (e) {
      g2Initialized = false;
      console.log('Create page failed, retrying...', e);
      if (retries > 0) setTimeout(() => tryCreatePage(retries - 1), 1000);
    }
  }

  await tryCreatePage(5);
}).catch(e => {
  bridgeReady = false;
  console.log('G2 bridge not available:', e);
  updateConnectionStatus();
});

window.addEventListener('beforeunload', () => {
  cleanupBridgeState();
});
