import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk';

// --- i18n ---
const i18n = {
  en: {
    settings: 'Settings',
    display: 'Display',
    glassesDisplay: 'Glasses Display',
    chineseAsr: 'Chinese ASR',
    englishAsr: 'English ASR',
    general: 'General',
    language: 'Language',
    clearAllRecordings: 'Clear All Recordings',
    about: 'About',
    aboutDesc: 'Chinese STT for Even G2',
    notConnected: 'Not Connected',
    ready: 'Ready',
    glassesConnected: 'Glasses Connected',
    newConversation: 'New Conversation',
    startRecording: 'Start Recording',
    stop: 'Stop',
    pause: 'Pause',
    continue: 'Continue',
    noRecordings: 'No recordings',
    whisperHint: 'Add your Deepgram API Key in Settings to get started',
    goToSettings: 'Go to Settings',
    clearTitle: 'Clear All Recordings?',
    clearMessage: 'This will permanently delete all recording history. This action cannot be undone.',
    cancel: 'Cancel',
    clear: 'Clear',
    confirm: 'Confirm',
    languageTitle: 'Language',
    iflytekSteps: [
      'Go to <a class="link-text" href="https://console.xfyun.cn" target="_blank" rel="noopener">console.xfyun.cn</a>',
      'Create an app and enable the "Real-time ASR" service',
      'Copy APPID, API Key, and API Secret above',
    ],
    deepgramSteps: [
      'Go to <a class="link-text" href="https://console.deepgram.com" target="_blank" rel="noopener">console.deepgram.com</a>',
      'Sign in and create a new API Key',
      'Copy the key and paste it above',
    ],
    chinese: 'Chinese',
    english: 'English',
  },
  zh: {
    settings: '设置',
    display: '显示',
    glassesDisplay: '眼镜显示',
    chineseAsr: '中文语音识别',
    englishAsr: '英文语音识别',
    general: '通用',
    language: '语言',
    clearAllRecordings: '清空所有录音',
    about: '关于',
    aboutDesc: 'Even G2 中文语音转文字',
    notConnected: '未连接',
    ready: '就绪',
    glassesConnected: '眼镜已连接',
    newConversation: '新对话',
    startRecording: '开始录音',
    stop: '停止',
    pause: '暂停',
    continue: '继续',
    noRecordings: '暂无录音',
    whisperHint: '请在设置中添加 Deepgram API Key',
    goToSettings: '前往设置',
    clearTitle: '清空所有录音？',
    clearMessage: '这将永久删除所有录音记录，此操作无法撤销。',
    cancel: '取消',
    clear: '清空',
    confirm: '确认',
    languageTitle: '语言',
    iflytekSteps: [
      '前往 <a class="link-text" href="https://console.xfyun.cn" target="_blank" rel="noopener">console.xfyun.cn</a>',
      '创建应用并开通「实时语音转写」服务',
      '将 APPID、API Key 和 API Secret 填入上方',
    ],
    deepgramSteps: [
      '前往 <a class="link-text" href="https://console.deepgram.com" target="_blank" rel="noopener">console.deepgram.com</a>',
      '登录并创建新的 API Key',
      '复制密钥并粘贴到上方',
    ],
    chinese: '中文',
    english: '英文',
  },
};

function t(key) {
  return i18n[currentLang]?.[key] || i18n.en[key] || key;
}

let currentLang = localStorage.getItem('voiceink_language') || 'en';

// --- State ---
let bridge = null;
let ws = null;
let wsConnected = false;
let recordingState = 'stopped'; // 'recording' | 'paused' | 'stopped'
let transcripts = []; // { text, offsetMs }
let recordings = JSON.parse(localStorage.getItem('voiceink_recordings') || '[]');
let wsUrl = localStorage.getItem('voiceink_ws_url') || 'ws://localhost:8080';
let activeEngine = 'iflytek';
let reconnectAttempts = 0;
let selectedHistoryDateKey = '';
const MAX_RECONNECT = 10;

// Recording timer state
let recordingStartTime = null;
let durationTimer = null;
let elapsedSeconds = 0;
let totalPausedMs = 0;
let pauseStartTime = null;

// Browser mic fallback
let browserAudioCtx = null;
let browserMicStream = null;
let browserWorkletNode = null;
let useBrowserMic = false;

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
const settingsButton = document.getElementById('settingsButton');
const backButton = document.getElementById('backButton');
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
const detailBackButton = document.getElementById('detailBackButton');
const detailTitle = document.getElementById('detailTitle');
const detailTranscriptList = document.getElementById('detailTranscriptList');
const buttonContainer = document.getElementById('buttonContainer');
const whisperKeyInput = document.getElementById('whisperKeyInput');
const tabBaidu = document.getElementById('tabBaidu');
const tabWhisper = document.getElementById('tabWhisper');
const iflytekAppId = document.getElementById('iflytekAppId');
const iflytekApiKey = document.getElementById('iflytekApiKey');
const iflytekApiSecret = document.getElementById('iflytekApiSecret');
const glassesDisplayToggle = document.getElementById('glassesDisplayToggle');
let glassesDisplayOn = localStorage.getItem('voiceink_glasses_display') !== 'off';

// --- Input Clear Buttons ---
const inputKeyMap = {
  iflytekAppId: 'voiceink_iflytek_appid',
  iflytekApiKey: 'voiceink_iflytek_apikey',
  iflytekApiSecret: 'voiceink_iflytek_apisecret',
  whisperKeyInput: 'voiceink_deepgram_key',
};

document.querySelectorAll('.input-clear').forEach(btn => {
  btn.addEventListener('click', () => {
    const inputId = btn.dataset.for;
    const input = document.getElementById(inputId);
    if (input) {
      input.value = '';
      const storageKey = inputKeyMap[inputId];
      if (storageKey) localStorage.removeItem(storageKey);
    }
  });
});

// Password visibility toggle
document.querySelectorAll('.input-toggle-vis').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.for);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.querySelector('img').src = isPassword ? '/eye-show.svg' : '/eye-hide.svg';
  });
});

glassesDisplayToggle.addEventListener('click', () => {
  glassesDisplayOn = !glassesDisplayOn;
  glassesDisplayToggle.src = glassesDisplayOn ? '/toggle-on.svg' : '/toggle-off.svg';
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

dialogConfirm.addEventListener('click', () => {
  recordings = [];
  localStorage.setItem('voiceink_recordings', '[]');
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

function applyLanguage() {
  // Settings page
  document.querySelector('#settingsPage .header h1').textContent = t('settings');
  document.querySelectorAll('.section-title').forEach(el => {
    if (el.textContent === 'Display' || el.textContent === '显示') el.textContent = t('display');
    if (el.textContent === 'Chinese ASR' || el.textContent === '中文语音识别') el.textContent = t('chineseAsr');
    if (el.textContent === 'English ASR' || el.textContent === '英文语音识别') el.textContent = t('englishAsr');
    if (el.textContent === 'General' || el.textContent === '通用') el.textContent = t('general');
    if (el.textContent === 'About' || el.textContent === '关于') el.textContent = t('about');
  });
  document.querySelector('.toggle-label').textContent = t('glassesDisplay');
  document.querySelector('#languageCard .settings-card-label').textContent = t('language');
  document.querySelector('#clearHistoryBtn .settings-card-label').textContent = t('clearAllRecordings');
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
    stepsHints[1].innerHTML = t('deepgramSteps').map((s, i) => `<p>${i + 1}. ${s}</p>`).join('');
  }

  // Dialog
  document.querySelector('.dialog-title').textContent = t('clearTitle');
  document.querySelector('.dialog-message').textContent = t('clearMessage');
  dialogCancel.textContent = t('cancel');
  dialogConfirm.textContent = t('clear');

  // Language modal
  document.querySelector('.modal-title').textContent = t('languageTitle');
  languageConfirmBtn.textContent = t('confirm');

  // Language value display
  languageValue.textContent = currentLang === 'zh' ? '中文' : 'English';

  // Update connection status text
  updateConnectionStatus();
  // Update buttons text
  updateButtons();
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

languageConfirmBtn.addEventListener('click', () => {
  currentLang = tempLang;
  localStorage.setItem('voiceink_language', currentLang);
  applyLanguage();
  languageModal.classList.add('hidden');
});

// --- Page Navigation ---
settingsButton.addEventListener('click', () => {
  settingsPage.classList.remove('hidden');
  whisperKeyInput.value = localStorage.getItem('voiceink_deepgram_key') || '';
  iflytekAppId.value = localStorage.getItem('voiceink_iflytek_appid') || '';
  iflytekApiKey.value = localStorage.getItem('voiceink_iflytek_apikey') || '';
  iflytekApiSecret.value = localStorage.getItem('voiceink_iflytek_apisecret') || '';
  glassesDisplayToggle.src = glassesDisplayOn ? '/toggle-on.svg' : '/toggle-off.svg';
});

backButton.addEventListener('click', () => {
  settingsPage.classList.add('hidden');
  const newKey = whisperKeyInput.value.trim();
  const oldKey = localStorage.getItem('voiceink_deepgram_key') || '';
  if (newKey !== oldKey) {
    localStorage.setItem('voiceink_deepgram_key', newKey);
    if (activeEngine === 'whisper' && recordingState === 'stopped') renderHistory();
  }
  localStorage.setItem('voiceink_iflytek_appid', iflytekAppId.value.trim());
  localStorage.setItem('voiceink_iflytek_apikey', iflytekApiKey.value.trim());
  localStorage.setItem('voiceink_iflytek_apisecret', iflytekApiSecret.value.trim());
  localStorage.setItem('voiceink_glasses_display', glassesDisplayOn ? 'on' : 'off');
  updateButtons();
});

// Detail page
detailBackButton.addEventListener('click', () => {
  detailPage.classList.add('hidden');
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
    historyDateTabs.style.display = dateKeys.length === 0 ? 'none' : '';
  } else {
    historyDateTabs.style.display = '';
  }

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

function deleteRecording(id) {
  recordings = recordings.filter(r => r.id !== id);
  localStorage.setItem('voiceink_recordings', JSON.stringify(recordings));
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
      const hasKey = !!localStorage.getItem('voiceink_deepgram_key');
      historyList.innerHTML = `
        <div class="empty-state">
          <img src="/nohistory.svg" width="32" height="32">
          <p>${t('noRecordings')}</p>
          ${hasKey ? '' : `<p class="empty-hint">${t('whisperHint')}</p>`}
          ${hasKey ? '' : `<button class="empty-settings-btn" id="emptySettingsBtn">${t('goToSettings')}</button>`}
        </div>`;
      const btn = document.getElementById('emptySettingsBtn');
      if (btn) btn.addEventListener('click', () => settingsButton.click());
    } else {
      historyList.innerHTML = `
        <div class="empty-state">
          <img src="/nohistory.svg" width="32" height="32">
          <p>${t('noRecordings')}</p>
        </div>`;
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
    deleteBtn.innerHTML = '<img src="/delete.svg" width="24" height="24">';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteRecording(record.id);
    });

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <img src="/record.svg" class="history-item-icon" width="24" height="24">
      <div class="history-item-content">
        <div class="history-item-name">${record.title}</div>
        <div class="history-item-date">${formatStartTime(new Date(record.startTime))} · ${formatDuration(record.duration)}</div>
      </div>
      <img src="/chevronArrow.svg" class="history-item-arrow" width="24" height="24">`;

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

    if (msg.type === 'transcription') {
      addTranscript(msg.text);
    } else if (msg.type === 'transcription_partial') {
      updatePartialTranscript(msg.text);
    } else if (msg.type === 'error') {
      console.error('Server error:', msg.message);
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
  if (recordingState !== 'stopped') return; // don't override during recording
  const glassesConnected = !!bridge;
  connectionDot.style.display = '';
  if (wsConnected) {
    connectionDot.classList.add('connected');
    recordingTitleText.textContent = t('ready');
    recordingStartTimeEl.textContent = glassesConnected ? t('glassesConnected') : '';
  } else {
    connectionDot.classList.remove('connected');
    recordingTitleText.textContent = t('notConnected');
    recordingStartTimeEl.textContent = glassesConnected ? t('glassesConnected') : '';
  }
  durationText.textContent = '';
  updateRecordingCardUI();
}

function hasCredentials() {
  if (activeEngine === 'iflytek') {
    return !!(localStorage.getItem('voiceink_iflytek_appid') && localStorage.getItem('voiceink_iflytek_apikey'));
  }
  if (activeEngine === 'whisper') {
    return !!localStorage.getItem('voiceink_deepgram_key');
  }
  return false;
}

function updateButtons() {
  if (recordingState === 'stopped') {
    const disabled = !hasCredentials();
    buttonContainer.innerHTML = `
      <button class="action-button primary" id="recordButton"${disabled ? ' disabled' : ''}>
        <img src="/start.svg" alt="Start" width="24" height="24">
        <span>${t('startRecording')}</span>
      </button>`;
  } else if (recordingState === 'recording') {
    buttonContainer.innerHTML = `
      <button class="action-button stop" id="stopButton">
        <img src="/stop.svg" alt="Stop" width="24" height="24">
        <span>${t('stop')}</span>
      </button>
      <button class="action-button secondary" id="pauseButton">
        <img src="/pause.svg" alt="Pause" width="24" height="24">
        <span>${t('pause')}</span>
      </button>`;
  } else if (recordingState === 'paused') {
    buttonContainer.innerHTML = `
      <button class="action-button stop" id="stopButton">
        <img src="/stop.svg" alt="Stop" width="24" height="24">
        <span>${t('stop')}</span>
      </button>
      <button class="action-button secondary" id="continueButton">
        <img src="/continue.svg" alt="Continue" width="24" height="24">
        <span>${t('continue')}</span>
      </button>`;
  }
  // Re-bind events
  const stopBtn = document.getElementById('stopButton');
  const pauseBtn = document.getElementById('pauseButton');
  const continueBtn = document.getElementById('continueButton');
  const startBtn = document.getElementById('recordButton');
  if (stopBtn) stopBtn.addEventListener('click', () => stopRecording());
  if (pauseBtn) pauseBtn.addEventListener('click', () => pauseRecording());
  if (continueBtn) continueBtn.addEventListener('click', () => resumeRecording());
  if (startBtn) startBtn.addEventListener('click', () => startRecording());
}

function saveRecording() {
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
  localStorage.setItem('voiceink_recordings', JSON.stringify(recordings));
}

// --- Audio (three-state) ---
async function startRecording() {
  if (recordingState !== 'stopped') return;
  recordingState = 'recording';
  transcripts = [];
  elapsedSeconds = 0;
  totalPausedMs = 0;
  pauseStartTime = null;
  recordingStartTime = Date.now();

  const engine = activeEngine === 'iflytek' ? 'iflytek' : activeEngine;
  const startMsg = { type: 'audio_start', engine };
  if (engine === 'iflytek') {
    startMsg.iflytekAppId = localStorage.getItem('voiceink_iflytek_appid') || '';
    startMsg.iflytekApiKey = localStorage.getItem('voiceink_iflytek_apikey') || '';
    startMsg.iflytekApiSecret = localStorage.getItem('voiceink_iflytek_apisecret') || '';
  } else if (engine === 'whisper') {
    startMsg.deepgramApiKey = localStorage.getItem('voiceink_deepgram_key') || '';
  }
  wsSend(startMsg);

  if (bridge) {
    bridge.audioControl(true);
  } else {
    await startBrowserMic();
  }

  // Update UI
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

  updateG2Display();
}

function pauseRecording() {
  if (recordingState !== 'recording') return;
  recordingState = 'paused';
  pauseStartTime = Date.now();

  stopDurationTimer();

  if (bridge) {
    bridge.audioControl(false);
  } else {
    stopBrowserMic();
  }

  wsSend({ type: 'audio_stop' });

  updateDurationDot();
  updateButtons();
  updateRecordingCardUI();
  updateG2Display();
}

async function resumeRecording() {
  if (recordingState !== 'paused') return;
  recordingState = 'recording';

  if (pauseStartTime) {
    totalPausedMs += Date.now() - pauseStartTime;
    pauseStartTime = null;
  }

  const engine = activeEngine === 'iflytek' ? 'iflytek' : activeEngine;
  const startMsg = { type: 'audio_start', engine };
  if (engine === 'iflytek') {
    startMsg.iflytekAppId = localStorage.getItem('voiceink_iflytek_appid') || '';
    startMsg.iflytekApiKey = localStorage.getItem('voiceink_iflytek_apikey') || '';
    startMsg.iflytekApiSecret = localStorage.getItem('voiceink_iflytek_apisecret') || '';
  } else if (engine === 'whisper') {
    startMsg.deepgramApiKey = localStorage.getItem('voiceink_deepgram_key') || '';
  }
  wsSend(startMsg);

  if (bridge) {
    bridge.audioControl(true);
  } else {
    await startBrowserMic();
  }

  updateDurationDot();
  updateButtons();
  updateRecordingCardUI();
  startDurationTimer();

  updateG2Display();
}

function stopRecording() {
  if (recordingState === 'stopped') return;

  const wasRecording = recordingState === 'recording';
  recordingState = 'stopped';

  stopDurationTimer();

  if (wasRecording) {
    if (bridge) {
      bridge.audioControl(false);
    } else {
      stopBrowserMic();
    }

    wsSend({ type: 'audio_stop' });
  }

  // Save recording if there are transcripts
  if (transcripts.length > 0) {
    saveRecording();
  }

  updateDurationDot();
  updateButtons();
  updateSections();
  updateRecordingCardUI();
  updateConnectionStatus();
  updateTabs();
  updateG2Display();
}

// --- Browser Mic Fallback ---
async function startBrowserMic() {
  try {
    browserMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    browserAudioCtx = new AudioContext({ sampleRate: 16000 });
    const source = browserAudioCtx.createMediaStreamSource(browserMicStream);

    // 用 ScriptProcessor 采集 PCM（兼容性好）
    const processor = browserAudioCtx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      if (recordingState !== 'recording') return;
      const float32 = e.inputBuffer.getChannelData(0);
      // Float32 → Int16 PCM
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      handleAudioData(new Uint8Array(int16.buffer));
    };

    source.connect(processor);
    processor.connect(browserAudioCtx.destination);
    browserWorkletNode = processor;
    useBrowserMic = true;
  } catch (e) {
    console.error('Browser mic error:', e);
  }
}

function stopBrowserMic() {
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
  useBrowserMic = false;
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
  if (recordingState !== 'recording') return;
  const bytes = getPcmBytes(pcm);
  updateVisualizerMeter(bytes);
  wsSendBinary(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

// --- Transcript ---
let lastTranscriptTime = 0;
const MERGE_THRESHOLD_MS = 3500;
const SHORT_FRAGMENT_LENGTH = 12;
const MAX_TRANSCRIPT_SEGMENT_LENGTH = 72;
const SENTENCE_END_RE = /[。！？!?]$/;

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
  }

  if (!body) {
    // 纯标点，已追加到上一条
    lastTranscriptTime = now;
    updateRecordingTitle();
    renderTranscripts();
    updateG2Display();
    return;
  }

  // 讯飞实时模式分段过碎，优先把短句和近邻片段并回上一条
  if (activeEngine === 'iflytek' && transcripts.length > 0) {
    const previous = transcripts[transcripts.length - 1];
    const withinMergeWindow = (now - lastTranscriptTime) < MERGE_THRESHOLD_MS;
    const previousEndsSentence = SENTENCE_END_RE.test(previous.text);
    const shouldMergeShortFragment = body.length <= SHORT_FRAGMENT_LENGTH;
    const hasRoom = (previous.text.length + body.length) <= MAX_TRANSCRIPT_SEGMENT_LENGTH;

    if ((withinMergeWindow || shouldMergeShortFragment) && (!previousEndsSentence || shouldMergeShortFragment) && hasRoom) {
      previous.text += body;
    } else {
      transcripts.push({ text: body, offsetMs });
    }
  } else {
    transcripts.push({ text: body, offsetMs });
  }
  lastTranscriptTime = now;
  updateRecordingTitle();
  renderTranscripts();
  updateG2Display();
}

function clearTranscripts() {
  transcripts = [];
  const partial = document.getElementById('partialTranscript');
  if (partial) partial.remove();
  updateRecordingTitle();
  renderTranscripts();
  updateG2Display();
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
function buildWelcomePage() {
  return {
    containerTotalNum: 1,
    textObject: [{
      xPosition: 20, yPosition: 20, width: 536, height: 248,
      containerID: 1001, containerName: 'welcome',
      content: 'VoiceInk\n\nTap to record\nDouble-tap to pause / stop',
      isEventCapture: 1,
      borderWidth: 0, borderColor: 0, borderRdaius: 0, paddingLength: 12,
    }]
  };
}

function buildTranscriptDisplay() {
  const status = recordingState === 'recording' ? '● Recording' : recordingState === 'paused' ? '|| Paused' : '○ Stopped';
  const latest = transcripts.length > 0 ? transcripts[transcripts.length - 1].text : 'Waiting for voice...';
  const content = `${status}\n\n${latest}`;

  return {
    containerTotalNum: 1,
    textObject: [{
      xPosition: 20, yPosition: 20, width: 536, height: 248,
      containerID: 1001, containerName: 'transcript',
      content,
      isEventCapture: 1,
      borderWidth: 0, borderColor: 0, borderRdaius: 0, paddingLength: 12,
    }]
  };
}

let g2Initialized = false;

async function updateG2Display() {
  if (!bridge) return;
  if (!glassesDisplayOn) return;

  try {
    if (!g2Initialized) {
      await bridge.createStartUpPageContainer(buildWelcomePage());
      g2Initialized = true;
    } else if (recordingState === 'stopped') {
      await bridge.rebuildPageContainer(buildWelcomePage());
    } else {
      await bridge.rebuildPageContainer(buildTranscriptDisplay());
    }
  } catch (e) {
    console.error('G2 display error:', e);
  }
}

// --- G2 Events ---
function handleG2Event(event) {
  // 音频事件
  if (event.audioEvent?.audioPcm) {
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
  // 双击：暂停 / 结束
  if (isDoubleClick) {
    if (recordingState === 'recording') pauseRecording();
    else if (recordingState === 'paused') stopRecording();
  }
}

// --- Tab Switching ---
function updateTabs() {
  const isActive = recordingState !== 'stopped';
  const inactiveTab = tabBaidu.classList.contains('active') ? tabWhisper : tabBaidu;
  if (isActive) {
    inactiveTab.classList.add('disabled');
  } else {
    tabBaidu.classList.remove('disabled');
    tabWhisper.classList.remove('disabled');
  }
}

tabBaidu.addEventListener('click', () => {
  if (tabBaidu.classList.contains('disabled')) return;
  tabBaidu.classList.add('active');
  tabWhisper.classList.remove('active');
  activeEngine = 'iflytek';
  if (recordingState === 'stopped') { renderHistory(); updateButtons(); }
});

tabWhisper.addEventListener('click', () => {
  if (tabWhisper.classList.contains('disabled')) return;
  tabWhisper.classList.add('active');
  tabBaidu.classList.remove('active');
  activeEngine = 'whisper';
  if (recordingState === 'stopped') { renderHistory(); updateButtons(); }
});

// --- Init ---
// WebSocket 和 G2 bridge 并行初始化，互不阻塞
applyLanguage();
updateDurationDot();
updateRecordingCardUI();
updateSections();
connectWebSocket();

waitForEvenAppBridge().then(async (b) => {
  bridge = b;
  console.log('G2 bridge initialized');
  bridge.onEvenHubEvent(handleG2Event);

  // 尝试创建页面，失败则延迟重试
  async function tryCreatePage(retries) {
    try {
      const result = await bridge.createStartUpPageContainer(buildWelcomePage());
      console.log('createStartUpPageContainer result:', result);
      if (result === 0) {
        g2Initialized = true;
        console.log('G2 page created');
      } else if (retries > 0) {
        setTimeout(() => tryCreatePage(retries - 1), 1000);
      }
    } catch (e) {
      console.log('Create page failed, retrying...', e);
      if (retries > 0) setTimeout(() => tryCreatePage(retries - 1), 1000);
    }
  }

  await tryCreatePage(5);
}).catch(e => {
  console.log('G2 bridge not available:', e);
});
