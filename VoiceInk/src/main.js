import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk';

// --- State ---
let bridge = null;
let ws = null;
let wsConnected = false;
let recordingState = 'stopped'; // 'recording' | 'paused' | 'stopped'
let audioChunks = [];
let autoStopTimer = null;
let transcripts = []; // { text, offsetMs }
let recordings = JSON.parse(localStorage.getItem('voiceink_recordings') || '[]');
let wsUrl = localStorage.getItem('voiceink_ws_url') || 'ws://localhost:8080';
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;
const MAX_RECORDING_MS = 30000;
const CHUNK_INTERVAL = 20;

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
const wsUrlInput = document.getElementById('wsUrlInput');
const tabBaidu = document.getElementById('tabBaidu');
const tabWhisper = document.getElementById('tabWhisper');

// --- Page Navigation ---
settingsButton.addEventListener('click', () => {
  settingsPage.classList.remove('hidden');
  wsUrlInput.value = wsUrl;
});

backButton.addEventListener('click', () => {
  settingsPage.classList.add('hidden');
  const newUrl = wsUrlInput.value.trim();
  if (newUrl && newUrl !== wsUrl) {
    wsUrl = newUrl;
    localStorage.setItem('voiceink_ws_url', wsUrl);
    connectWebSocket();
  }
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

function deleteRecording(id) {
  recordings = recordings.filter(r => r.id !== id);
  localStorage.setItem('voiceink_recordings', JSON.stringify(recordings));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  historyList.innerHTML = '';

  if (recordings.length === 0) {
    container.classList.add('empty');
    historyList.innerHTML = `
      <div class="empty-state">
        <img src="/nohistory.svg" width="32" height="32">
        <p>No recordings</p>
      </div>`;
    return;
  }

  container.classList.remove('empty');

  recordings.forEach((record) => {
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
    recordingTitleText.textContent = 'New Conversation';
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

function updateConnectionStatus() {
  if (recordingState !== 'stopped') return; // don't override during recording
  const glassesConnected = !!bridge;
  connectionDot.style.display = '';
  if (wsConnected) {
    recordingCard.classList.remove('disconnected');
    connectionDot.classList.add('connected');
    recordingTitleText.textContent = 'Ready';
    recordingStartTimeEl.textContent = glassesConnected ? 'Glasses Connected' : '';
  } else {
    recordingCard.classList.add('disconnected');
    connectionDot.classList.remove('connected');
    recordingTitleText.textContent = 'Not Connected';
    recordingStartTimeEl.textContent = glassesConnected ? 'Glasses Connected' : '';
  }
  durationText.textContent = '';
}

function updateButtons() {
  if (recordingState === 'stopped') {
    buttonContainer.innerHTML = `
      <button class="action-button primary" id="recordButton">
        <img src="/start.svg" alt="Start" width="24" height="24">
        <span>Start Recording</span>
      </button>`;
  } else if (recordingState === 'recording') {
    buttonContainer.innerHTML = `
      <button class="action-button stop" id="stopButton">
        <img src="/stop.svg" alt="Stop" width="24" height="24">
        <span>Stop</span>
      </button>
      <button class="action-button secondary" id="pauseButton">
        <img src="/pause.svg" alt="Pause" width="24" height="24">
        <span>Pause</span>
      </button>`;
  } else if (recordingState === 'paused') {
    buttonContainer.innerHTML = `
      <button class="action-button stop" id="stopButton">
        <img src="/stop.svg" alt="Stop" width="24" height="24">
        <span>Stop</span>
      </button>
      <button class="action-button secondary" id="continueButton">
        <img src="/continue.svg" alt="Continue" width="24" height="24">
        <span>Continue</span>
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
  audioChunks = [];
  transcripts = [];
  elapsedSeconds = 0;
  totalPausedMs = 0;
  pauseStartTime = null;
  recordingStartTime = Date.now();

  wsSend({ type: 'audio_start' });

  if (bridge) {
    bridge.audioControl(true);
  } else {
    await startBrowserMic();
  }

  // Update UI
  recordingCard.classList.remove('disconnected');
  updateDurationDot();
  durationText.textContent = '00:00:00';
  recordingStartTimeEl.textContent = formatStartTime(new Date(recordingStartTime));
  updateRecordingTitle();
  renderTranscripts();
  updateButtons();
  updateSections();
  startDurationTimer();
  updateTabs();

  autoStopTimer = setTimeout(() => stopRecording(), MAX_RECORDING_MS);
  updateG2Display();
}

function pauseRecording() {
  if (recordingState !== 'recording') return;
  recordingState = 'paused';
  pauseStartTime = Date.now();

  if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
  stopDurationTimer();

  if (bridge) {
    bridge.audioControl(false);
  } else {
    stopBrowserMic();
  }

  // Flush remaining chunks
  if (audioChunks.length > 0) {
    const combined = mergeChunks(audioChunks);
    wsSendBinary(combined);
    audioChunks = [];
  }

  wsSend({ type: 'audio_stop' });

  updateDurationDot();
  updateButtons();
  updateG2Display();
}

async function resumeRecording() {
  if (recordingState !== 'paused') return;
  recordingState = 'recording';

  if (pauseStartTime) {
    totalPausedMs += Date.now() - pauseStartTime;
    pauseStartTime = null;
  }

  wsSend({ type: 'audio_start' });

  if (bridge) {
    bridge.audioControl(true);
  } else {
    await startBrowserMic();
  }

  updateDurationDot();
  updateButtons();
  startDurationTimer();

  autoStopTimer = setTimeout(() => stopRecording(), MAX_RECORDING_MS);
  updateG2Display();
}

function stopRecording() {
  if (recordingState === 'stopped') return;

  const wasRecording = recordingState === 'recording';
  recordingState = 'stopped';

  if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
  stopDurationTimer();

  if (wasRecording) {
    if (bridge) {
      bridge.audioControl(false);
    } else {
      stopBrowserMic();
    }

    // Flush remaining chunks
    if (audioChunks.length > 0) {
      const combined = mergeChunks(audioChunks);
      wsSendBinary(combined);
      audioChunks = [];
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

function handleAudioData(pcm) {
  if (recordingState !== 'recording') return;
  audioChunks.push(new Uint8Array(pcm));

  if (audioChunks.length >= CHUNK_INTERVAL) {
    const combined = mergeChunks(audioChunks);
    wsSendBinary(combined);
    audioChunks = [];
  }
}

function mergeChunks(chunks) {
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { merged.set(c, offset); offset += c.length; }
  return merged.buffer;
}

// --- Transcript ---
function addTranscript(text) {
  if (!text || !text.trim()) return;
  const offsetMs = elapsedSeconds * 1000;
  transcripts.push({ text: text.trim(), offsetMs });
  updateRecordingTitle();
  renderTranscripts();
  updateG2Display();
}

function clearTranscripts() {
  transcripts = [];
  updateRecordingTitle();
  renderTranscripts();
  updateG2Display();
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
      content: 'VoiceInk\n\nLet voice flow like ink.\n\nTap to start recording.',
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
  const ev = event.textEvent || event.listEvent;
  if (!ev) {
    // 音频事件
    if (event.audioEvent?.audioPcm) {
      handleAudioData(event.audioEvent.audioPcm);
      return;
    }
    return;
  }

  const eventType = ev.eventType;

  // 单击：三态切换
  if (eventType === 0) {
    if (recordingState === 'stopped') startRecording();
    else if (recordingState === 'recording') pauseRecording();
    else if (recordingState === 'paused') resumeRecording();
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
  tabBaidu.classList.add('active');
  tabWhisper.classList.remove('active');
});

tabWhisper.addEventListener('click', () => {
  tabWhisper.classList.add('active');
  tabBaidu.classList.remove('active');
});

// --- Init ---
// WebSocket 和 G2 bridge 并行初始化，互不阻塞
updateButtons();
updateDurationDot();
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
