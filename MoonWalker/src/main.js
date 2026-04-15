import { waitForEvenAppBridge, ImageContainerProperty, RebuildPageContainer } from '@evenrealities/even_hub_sdk';

// Amap API Key (from environment variable)
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;
const APP_VERSION = __APP_VERSION__;

// Base URL for assets (handles sub-path deployment)
const BASE = import.meta.env.BASE_URL;

// --- SVG Icon Constants ---
const ICON_NAV_ARROW = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 21.75H12V20.25H13.5V21.75ZM15 20.25H13.5V18.75H15V20.25ZM16.5 18.75H15V17.25H16.5V18.75ZM18 17.25H16.5V15.75H18V17.25ZM19.5 15.75H18V14.25H19.5V15.75ZM21 14.25H19.5V12.75H21V14.25ZM19.5 12.75H1.5V11.25H19.5V12.75ZM22.5 11.25V12.75H21V11.25H22.5ZM21 11.25H19.5V9.75H21V11.25ZM19.5 9.75H18V8.25H19.5V9.75ZM18 8.25H16.5V6.75H18V8.25ZM16.5 6.75H15V5.25H16.5V6.75ZM15 5.25H13.5V3.75H15V5.25ZM13.5 3.75H12V2.25H13.5V3.75Z" fill="currentColor"/>
  </svg>`;

const ICON_CANCEL = `
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_cancel)">
      <path d="M22 27H10V25H22V27ZM24 25H22V23H24V25ZM26 23H24V15H26V23ZM14 19H12V17H14V19ZM12 17H10V15H12V17ZM10 15H8V13H10V15ZM24 15H22V13H24V15ZM8 13H6V11H8V13ZM22 13H10V11H22V13ZM10 11H8V9H10V11ZM12 9H10V7H12V9ZM14 7H12V5H14V7Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_cancel">
        <rect width="32" height="32" fill="white"/>
      </clipPath>
    </defs>
  </svg>`;

const ICON_CONNECTED = `
  <svg class="status-card-icon success" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.99902 16.501H2.99902V15.001H8.99902V16.501ZM21.001 16.501H15V15.001H21.001V16.501ZM13.5 12.001H10.501V15H9.00098V12H10.5V8.99902H13.5V12.001ZM15.001 15H13.501V12H15.001V15ZM10.5 9H3V14.999H1.5V8.99902H2.99902V7.5H10.5V9ZM21.002 8.99902H22.5V14.999H21V9H13.502V7.5H21.002V8.99902Z" fill="currentColor"/>
  </svg>`;

const ICON_NAVIGATING = `
  <svg class="status-card-icon success" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_nav)">
      <path d="M12.75 23.25H11.25V21.75H12.75V23.25ZM11.25 21.75H9.75V18.75H11.25V21.75ZM14.25 21.75H12.75V18.75H14.25V21.75ZM9.75 18.75H8.25V15.75H9.75V18.75ZM15.75 18.75H14.25V15.75H15.75V18.75ZM8.25 15.75H5.25V14.25H8.25V15.75ZM17.25 15.75H15.75V12H17.25V15.75ZM5.25 14.25H2.25V12.75H5.25V14.25ZM2.25 12.75H0.75V11.25H2.25V12.75ZM18.75 12H17.25V9H18.75V12ZM5.25 11.25H2.25V9.75H5.25V11.25ZM8.25 9.75H5.25V8.25H8.25V9.75ZM20.25 9H18.75V6H20.25V9ZM12 8.25H8.25V6.75H12V8.25ZM15 6.75H12V5.25H15V6.75ZM21.75 2.25V6H20.25V3.75H18V2.25H21.75ZM18 5.25H15V3.75H18V5.25Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_nav">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>`;

const ICON_DISCONNECTED = `
  <svg class="status-card-icon warning" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_disc)">
      <path d="M18.75 21.75H15V20.25H18.75V21.75ZM5.25098 20.25H3.75098V18.75H5.25098V20.25ZM15 20.25H13.5V18.75H15V20.25ZM20.25 20.25H18.75V18.75H20.25V20.25ZM6.75098 18.75H5.25098V17.25H6.75098V18.75ZM13.5 18.75H12V17.25H13.5V18.75ZM21.75 18.75H20.25V15H21.75V18.75ZM8.25098 17.25H6.75098V15.75H8.25098V17.25ZM11.25 14.25H9.75098V15.75H8.25098V14.25H9.75V12.75H11.25V14.25ZM20.25 15H18.75V13.5H20.25V15ZM18.75 13.5H17.25V12H18.75V13.5ZM6.75 12H5.25V10.5H6.75V12ZM14.25 11.25H12.75V9.75H14.25V11.25ZM5.25 10.5H3.75V9H5.25V10.5ZM15.751 9.75H14.251V8.25H15.751V9.75ZM3.75 9H2.25V5.25H3.75V9ZM17.251 8.25H15.751V6.75H17.251V8.25ZM12 6.75H10.5V5.25H12V6.75ZM18.751 6.75H17.251V5.25H18.751V6.75ZM5.25 5.25H3.75V3.75H5.25V5.25ZM10.5 5.25H9V3.75H10.5V5.25ZM20.251 5.25H18.751V3.75H20.251V5.25ZM9 3.75H5.25V2.25H9V3.75Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_disc">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>`;

// Display position Y offsets for navigation page (G2 canvas: 576×288)
const DISPLAY_POSITIONS = {
  top: { navArrow: 20, navDistance: 20, navQuote: 220 },
  middle: { navArrow: 100, navDistance: 100, navQuote: 220 },
  bottom: { navArrow: 180, navDistance: 180, navQuote: 220 }
};

function getDisplayOffsets() {
  return DISPLAY_POSITIONS[state.displayPosition] || DISPLAY_POSITIONS.top;
}

function createWelcomeTextObjects() {
  return [
    {
      xPosition: 20,
      yPosition: 20,
      width: 480,
      height: 80,
      borderWidth: 0,
      borderColor: 0,
      borderRadius: 0,
      paddingLength: 0,
      containerID: 1001,
      containerName: 'title',
      isEventCapture: 0,
      content: 'MoonWalker'
    },
    {
      xPosition: 20,
      yPosition: 80,
      width: 480,
      height: 150,
      borderWidth: 0,
      borderColor: 0,
      borderRadius: 0,
      paddingLength: 0,
      containerID: 1002,
      containerName: 'intro',
      isEventCapture: 1,
      content: 'Pending destination,\ncontinue on phone'
    }
  ];
}

// --- App State ---
const state = {
  bridge: null,
  isConnected: false,
  selectedLocation: null,
  userLocation: null,
  isNavigating: false,
  navigationInterval: null,
  quoteInterval: null,
  quoteRetryInterval: null,
  quoteHideTimeout: null, // Timeout for hiding quote after duration
  pageCreated: false,
  mapService: 'amap', // 'amap' or 'photon'
  navigationHistory: [], // Store navigation history
  philosophyEnabled: true, // Philosophy quotes enabled by default
  quoteDuration: 10, // Quote display duration in seconds (10, 30, 60, or 'always')
  contentSources: {
    stoic: true,
    hitokoto: false
  },
  currentHeading: null, // Device heading in degrees (0-360, null if unavailable)
  orientationSupported: false, // Whether orientation is available
  displayPosition: 'top' // Display position on G2 (top, middle, bottom)
};

// Load navigation history from localStorage
function loadNavigationHistory() {
  try {
    const saved = localStorage.getItem('navigationHistory');
    if (saved) {
      state.navigationHistory = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load navigation history:', error);
  }
}

// Save navigation history to localStorage
function saveNavigationHistory() {
  try {
    localStorage.setItem('navigationHistory', JSON.stringify(state.navigationHistory));
  } catch (error) {
    console.error('Failed to save navigation history:', error);
  }
}

// Add location to navigation history
function addToNavigationHistory(location) {
  // Check if already exists
  const exists = state.navigationHistory.some(item =>
    item.location === location.location
  );

  if (!exists) {
    state.navigationHistory.unshift(location);
    // Keep only last 20 items
    if (state.navigationHistory.length > 20) {
      state.navigationHistory = state.navigationHistory.slice(0, 20);
    }
    saveNavigationHistory();
  }
}

// Load philosophy setting from localStorage
function loadPhilosophySetting() {
  try {
    const saved = localStorage.getItem('philosophyEnabled');
    if (saved !== null) {
      state.philosophyEnabled = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load philosophy setting:', error);
  }
}

// Save philosophy setting to localStorage
function savePhilosophySetting() {
  try {
    localStorage.setItem('philosophyEnabled', JSON.stringify(state.philosophyEnabled));
  } catch (error) {
    console.error('Failed to save philosophy setting:', error);
  }
}

// Load quote duration setting from localStorage
function loadQuoteDurationSetting() {
  try {
    const saved = localStorage.getItem('quoteDuration');
    if (saved !== null) {
      state.quoteDuration = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load quote duration setting:', error);
  }
}

// Save quote duration setting to localStorage
function saveQuoteDurationSetting() {
  try {
    localStorage.setItem('quoteDuration', JSON.stringify(state.quoteDuration));
  } catch (error) {
    console.error('Failed to save quote duration setting:', error);
  }
}

// Load content sources setting from localStorage
function loadContentSourcesSetting() {
  try {
    const saved = localStorage.getItem('contentSources');
    if (saved !== null) {
      state.contentSources = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load content sources setting:', error);
  }
}

// Save content sources setting to localStorage
function saveContentSourcesSetting() {
  try {
    localStorage.setItem('contentSources', JSON.stringify(state.contentSources));
  } catch (error) {
    console.error('Failed to save content sources setting:', error);
  }
}

// Load display position setting from localStorage
function loadDisplayPositionSetting() {
  try {
    const position = localStorage.getItem('displayPosition');
    if (position !== null) {
      state.displayPosition = position;
    }
  } catch (error) {
    console.error('Failed to load display position setting:', error);
  }
}

// Save display position setting to localStorage
function saveDisplayPositionSetting() {
  try {
    localStorage.setItem('displayPosition', state.displayPosition);
  } catch (error) {
    console.error('Failed to save display position setting:', error);
  }
}

// Fetch stoic quote from stoic-quotes.com
async function fetchStoicQuote() {
  const response = await fetch('https://stoic-quotes.com/api/quote');
  if (!response.ok) throw new Error('Stoic API failed');
  const data = await response.json();
  return `"${data.text}" — ${data.author}`;
}

// Fetch quote from hitokoto (anime/literary quotes)
async function fetchHitokotoQuote() {
  const response = await fetch('https://v1.hitokoto.cn/?c=i&c=k');
  if (!response.ok) throw new Error('Hitokoto API failed');
  const data = await response.json();
  const author = data.from ? ` — ${data.from}` : '';
  return `"${data.hitokoto}"${author}`;
}

// Pick a random enabled source and fetch a quote
async function fetchQuoteFromEnabledSources() {
  const enabled = Object.entries(state.contentSources)
    .filter(([, on]) => on)
    .map(([key]) => key);

  if (enabled.length === 0) return '';

  const source = enabled[Math.floor(Math.random() * enabled.length)];

  try {
    console.log(`Fetching quote from: ${source}`);
    let result;
    switch (source) {
      case 'stoic':     result = await fetchStoicQuote(); break;
      case 'hitokoto':  result = await fetchHitokotoQuote(); break;
      default:          result = '';
    }
    console.log(`Quote fetched from ${source}:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to fetch quote from ${source}:`, error);
    throw error;
  }
}

// Fetch quote with retry logic
async function fetchQuoteWithRetry() {
  try {
    const quote = await fetchQuoteFromEnabledSources();
    // Clear retry interval if successful
    if (state.quoteRetryInterval) {
      clearInterval(state.quoteRetryInterval);
      state.quoteRetryInterval = null;
    }
    return quote;
  } catch (error) {
    return 'Request failed, retrying...';
  }
}

// Update quote on glasses
async function updateQuoteOnGlasses(quote) {
  if (!state.bridge || !state.isConnected || !state.pageCreated) return;

  try {
    await state.bridge.textContainerUpgrade({
      containerID: 1003,
      containerName: 'quote',
      contentOffset: 0,
      contentLength: 200,
      content: quote
    });

    // Clear any existing hide timeout
    if (state.quoteHideTimeout) {
      clearTimeout(state.quoteHideTimeout);
      state.quoteHideTimeout = null;
    }

    // If duration is not 'always', schedule hiding the quote
    if (state.quoteDuration !== 'always' && quote !== '') {
      state.quoteHideTimeout = setTimeout(async () => {
        await state.bridge.textContainerUpgrade({
          containerID: 1003,
          containerName: 'quote',
          contentOffset: 0,
          contentLength: 200,
          content: ''
        });
      }, state.quoteDuration * 1000);
    }
  } catch (error) {
    console.error('Failed to update quote:', error);
  }
}

// Initialize EvenHub Bridge
async function initBridge() {
  try {
    console.log('Initializing bridge...');
    state.bridge = await waitForEvenAppBridge();
    console.log('Bridge initialized:', state.bridge);

    // Listen for device status changes
    state.bridge.onDeviceStatusChanged(async (status) => {
      console.log('Device status changed:', status);
      if (status.connectType === 'Connected') {
        state.isConnected = true;
        console.log('Device connected, isConnected:', state.isConnected);

        // Create initial page on first connection
        if (!state.pageCreated) {
          console.log('Creating initial page...');
          await createInitialPage();
        }
      } else if (status.connectType === 'Disconnected') {
        state.isConnected = false;
        state.pageCreated = false;
        console.log('Device disconnected');
        updateStatus('Glasses disconnected', 'error');
        stopNavigation();
      }
    });

    // Listen for glasses interaction events
    state.bridge.onEvenHubEvent((event) => {
      console.log('EvenHub event:', event);
      // Double-click toggles navigation
      if (event.textEvent && event.textEvent.eventType === 'DoubleClick') {
        toggleNavigation();
      }
    });

    // Proactively check device status
    setTimeout(async () => {
      try {
        const deviceInfo = await state.bridge.getDeviceInfo();
        console.log('Device info:', deviceInfo);
        if (deviceInfo && !state.pageCreated) {
          console.log('Device detected, forcing page creation...');
          state.isConnected = true;
          await createInitialPage();
        }
      } catch (error) {
        console.error('Failed to get device info:', error);
      }
    }, 1000);
  } catch (error) {
    console.error('Bridge init failed:', error);
    updateStatus('Initialization failed', 'error');
  }
}


// Load arrow icon for navigation
async function loadArrowIcon() {
  try {
    const response = await fetch(`${BASE}arrow-icon.svg`);
    if (!response.ok) {
      console.error('Failed to fetch arrow icon:', response.status);
      return null;
    }
    const svgText = await response.text();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Create 28x28 canvas
        const canvas = document.createElement('canvas');
        canvas.width = 28;
        canvas.height = 28;
        const ctx = canvas.getContext('2d');

        // Draw SVG without background
        ctx.drawImage(img, 0, 0, 28, 28);

        // Convert to PNG base64
        const base64 = canvas.toDataURL('image/png');
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      img.onerror = reject;
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Failed to load arrow icon:', error);
    return null;
  }
}

// Create initial welcome page on glasses
async function createInitialPage() {
  try {
    console.log('createInitialPage called, isConnected:', state.isConnected, 'pageCreated:', state.pageCreated);

    const result = await state.bridge.createStartUpPageContainer({
      containerTotalNum: 2,
      textObject: createWelcomeTextObjects(),
      imageObject: []
    });

    console.log('createStartUpPageContainer result:', result);
    if (result === 0) {
      state.pageCreated = true;
      console.log('Initial page created successfully, pageCreated:', state.pageCreated);
    } else {
      console.error('Failed to create page, result code:', result);
    }
  } catch (error) {
    console.error('Create page error:', error);
  }
}

// Update status card display
function updateStatus(message, type = 'info') {
  const statusCardsEl = document.getElementById('statusCards');

  // Determine icon and style based on type
  const isSuccess = type === 'connected' || type === 'navigating';
  const cardClass = isSuccess ? 'success' : 'warning';
  const icon = type === 'connected' ? ICON_CONNECTED
    : type === 'navigating' ? ICON_NAVIGATING
    : ICON_DISCONNECTED;
  const displayMessage = type === 'connected' ? 'Glasses connected'
    : type === 'navigating' ? 'Navigating'
    : message;

  statusCardsEl.innerHTML = `
    <div class="status-card ${cardClass}">
      ${icon}
      <div class="status-card-content">
        <span class="status-card-message ${cardClass}">${displayMessage}</span>
      </div>
    </div>
  `;

  // Show toast with animation
  const card = statusCardsEl.querySelector('.status-card');
  setTimeout(() => card.classList.add('show'), 10);

  // Auto hide after 3 seconds
  setTimeout(() => {
    card.classList.remove('show');
    setTimeout(() => {
      statusCardsEl.innerHTML = '';
    }, 300);
  }, 3000);
}

// Show status card with custom message and duration
function showStatusCard(message, type = 'success', duration = 3000) {
  const statusCardsEl = document.getElementById('statusCards');

  const cardClass = type === 'success' ? 'success' : 'warning';
  const icon = type === 'success' ? ICON_CONNECTED : ICON_DISCONNECTED;

  statusCardsEl.innerHTML = `
    <div class="status-card ${cardClass}">
      ${icon}
      <div class="status-card-content">
        <span class="status-card-message ${cardClass}">${message}</span>
      </div>
    </div>
  `;

  // Show toast with animation
  const card = statusCardsEl.querySelector('.status-card');
  setTimeout(() => card.classList.add('show'), 10);

  // Auto hide after specified duration
  setTimeout(() => {
    card.classList.remove('show');
    setTimeout(() => {
      statusCardsEl.innerHTML = '';
    }, 300);
  }, duration);
}

// Show location failed card with retry button
function showLocationFailedCard() {
  const statusCardsEl = document.getElementById('statusCards');

  statusCardsEl.innerHTML = `
    <div class="status-card warning">
      ${ICON_DISCONNECTED}
      <div class="status-card-content">
        <span class="status-card-message warning">Location failed. Please enable GPS.</span>
      </div>
      <button class="status-card-retry" onclick="retryNavigation()">Try Again</button>
    </div>
  `;

  const card = statusCardsEl.querySelector('.status-card');
  setTimeout(() => card.classList.add('show'), 10);

  // Auto hide after 3 seconds
  setTimeout(() => {
    card.classList.remove('show');
    setTimeout(() => {
      statusCardsEl.innerHTML = '';
    }, 300);
  }, 3000);
}

// Retry navigation after location failure
async function retryNavigation() {
  const statusCardsEl = document.getElementById('statusCards');
  statusCardsEl.innerHTML = '';

  try {
    const location = await getUserLocation();
    state.userLocation = location;
    await startNavigationCore();
  } catch (error) {
    console.error('Retry failed:', error);
    showLocationFailedCard();
  }
}

// Search location using Amap API (China)
async function searchLocation(keyword) {
  if (!keyword.trim()) return [];

  try {
    const url = `https://restapi.amap.com/v3/place/text?key=${AMAP_KEY}&keywords=${encodeURIComponent(keyword)}&city=全国&output=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.pois) {
      return data.pois.map(poi => ({
        name: poi.name,
        address: poi.address || poi.pname + poi.cityname + poi.adname,
        location: poi.location, // "lng,lat"
        distance: poi.distance
      }));
    }
    return [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

// Search location using Photon API (global, OpenStreetMap-based)
async function searchLocationPhoton(keyword) {
  if (!keyword.trim()) return [];

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(keyword)}&limit=10`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features.map(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;

        const addressParts = [
          props.street,
          props.city,
          props.state,
          props.country
        ].filter(Boolean);

        return {
          name: props.name || props.street || 'Unknown',
          address: addressParts.join(', ') || 'No address',
          location: `${coords[0]},${coords[1]}` // "lng,lat"
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Photon search failed:', error);
    return [];
  }
}


// Initialize device orientation tracking (iOS/Android compatible)
async function initOrientation() {
  try {
    // iOS 13+ permission request
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        console.warn('Orientation permission denied');
        return false;
      }
    }

    // Check API support
    if (typeof DeviceOrientationEvent === 'undefined') {
      console.warn('DeviceOrientationEvent not supported');
      return false;
    }

    // Listen for orientation changes
    window.addEventListener('deviceorientation', (event) => {
      // iOS: use webkitCompassHeading (true north)
      if (typeof event.webkitCompassHeading === 'number') {
        state.currentHeading = event.webkitCompassHeading;
      }
      // Android: use alpha (magnetic north, needs reversal)
      else if (typeof event.alpha === 'number') {
        state.currentHeading = (360 - event.alpha) % 360;
      }
      else {
        state.currentHeading = null;
      }
    }, true);

    state.orientationSupported = true;
    console.log('Orientation tracking initialized');
    return true;
  } catch (error) {
    console.error('Orientation init failed:', error);
    return false;
  }
}

// Get user's current location with multi-layer fallback
async function getUserLocation() {
    // Priority 1: URL parameters (for simulator debugging)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLat = urlParams.get('lat');
  const urlLng = urlParams.get('lng');
  if (urlLat && urlLng) {
    console.log('Using location from URL parameters');
    return { lat: parseFloat(urlLat), lng: parseFloat(urlLng) };
  }

  // Priority 2: Try navigator.geolocation (may crash on some G2 versions)
  if (navigator.geolocation) {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      });
    });
    console.log('Using GPS location');
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  }

  // Priority 3: No GPS available, throw error
  throw new Error('GPS not available');
}

// Calculate bearing and distance between two coordinates
function calculateDirection(from, to) {
  const fromLng = parseFloat(from.lng);
  const fromLat = parseFloat(from.lat);
  const toLng = parseFloat(to.lng);
  const toLat = parseFloat(to.lat);

  // Convert to radians
  const fromLatRad = fromLat * Math.PI / 180;
  const toLatRad = toLat * Math.PI / 180;
  const dLngRad = (toLng - fromLng) * Math.PI / 180;

  // Calculate bearing (0-360°, north = 0)
  const y = Math.sin(dLngRad) * Math.cos(toLatRad);
  const x = Math.cos(fromLatRad) * Math.sin(toLatRad) -
            Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(dLngRad);
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;

  // Calculate distance in meters (Haversine formula)
  const R = 6371000;
  const Δφ = (toLat - fromLat) * Math.PI / 180;
  const Δλ = dLngRad;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(fromLatRad) * Math.cos(toLatRad) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return { bearing, distance };
}

// Get direction arrow from bearing angle (8 directions)
// If device heading available, calculate relative turn angle
function getDirectionArrow(bearing) {
  const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];

  // If orientation available, calculate relative angle
  if (state.currentHeading !== null) {
    const turnAngle = (bearing - state.currentHeading + 360) % 360;
    const index = Math.round(turnAngle / 45) % 8;
    return directions[index];
  }

  // Fallback: use absolute bearing
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

// Format distance for display
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// Switch glasses to navigation display mode (arrow + distance text)
async function switchToNavigationMode() {
  console.log('switchToNavigationMode called, state:', {
    bridge: !!state.bridge,
    isConnected: state.isConnected,
    pageCreated: state.pageCreated
  });

  if (!state.bridge || !state.isConnected || !state.pageCreated) {
    console.warn('Cannot switch to navigation mode, conditions not met');
    return;
  }

  try {
    console.log('Rebuilding page with arrow, distance, and quote...');

    // Fetch initial quote with retry (only if philosophy is enabled)
    let initialQuote = '';
    if (state.philosophyEnabled) {
      initialQuote = await fetchQuoteWithRetry();

      // If quote failed, start retry interval
      if (initialQuote === 'Request failed, retrying...') {
        state.quoteRetryInterval = setInterval(async () => {
          try {
            const newQuote = await fetchQuoteFromEnabledSources();
            await updateQuoteOnGlasses(newQuote);
            clearInterval(state.quoteRetryInterval);
            state.quoteRetryInterval = null;
          } catch (error) {
            console.log('Retrying quote fetch...');
          }
        }, 5000); // Retry every 5 seconds
      }
    }

    // Create arrow image container
    const offsets = getDisplayOffsets();
    const arrowImageContainer = new ImageContainerProperty({
      xPosition: 20,
      yPosition: offsets.navArrow,
      width: 28,
      height: 28,
      containerID: 1001,
      containerName: 'arrow'
    });

    await state.bridge.rebuildPageContainer(new RebuildPageContainer({
      containerTotalNum: 3,
      textObject: [
        {
          xPosition: 72,
          yPosition: offsets.navDistance,
          width: 330,
          height: 80,
          borderWidth: 0,
          borderColor: 0,
          borderRadius: 0,
          paddingLength: 0,
          containerID: 1002,
          containerName: 'distance',
          isEventCapture: 1,
          content: 'Calculating...'
        },
        {
          xPosition: 20,
          yPosition: offsets.navQuote,
          width: 480,
          height: 60,
          borderWidth: 0,
          borderColor: 0,
          borderRadius: 0,
          paddingLength: 0,
          containerID: 1003,
          containerName: 'quote',
          isEventCapture: 0,
          content: initialQuote
        }
      ],
      imageObject: [arrowImageContainer]
    }));

    // Load and display arrow icon
    const arrowIconData = await loadArrowIcon();
    if (arrowIconData) {
      await state.bridge.updateImageRawData({
        containerID: 1001,
        containerName: 'arrow',
        imageData: arrowIconData
      });
    }

    console.log('Navigation mode switched successfully');
  } catch (error) {
    console.error('Failed to switch to navigation mode:', error);
  }
}

// Update distance text on glasses
async function updateGlassesDisplay(text) {
  if (!state.bridge || !state.isConnected || !state.pageCreated) return;

  try {
    await state.bridge.textContainerUpgrade({
      containerID: 1002,
      containerName: 'distance',
      contentOffset: 0,
      contentLength: 50,
      content: text
    });
  } catch (error) {
    console.error('Failed to update glasses:', error);
  }
}

// Set nav button content with arrow icon and label
function setNavButtonContent(label, isNavigating = false) {
  const icon = isNavigating ? ICON_CANCEL : ICON_NAV_ARROW;
  document.getElementById('navButton').innerHTML = `${icon}<span>${label}</span>`;
}

// Start navigation to selected location (core logic)
async function startNavigationCore() {
  if (!state.selectedLocation) return;

  try {
    const glassesConnected = state.bridge && state.isConnected;

    if (glassesConnected && !state.pageCreated) {
      await createInitialPage();
      if (!state.pageCreated) {
        updateStatus('Initialization failed', 'error');
        return;
      }
    }

    // Add to navigation history
    addToNavigationHistory(state.selectedLocation);

    state.isNavigating = true;

    // Update button to show "Cancel Navigation"
    setNavButtonContent('Cancel Navigation', true);

    if (glassesConnected) {
      await switchToNavigationMode();
    } else {
      updateStatus('Navigating (glasses not connected)', 'info');
    }

    // Update quote every 10 minutes (only if philosophy is enabled)
    if (state.philosophyEnabled && glassesConnected) {
      state.quoteInterval = setInterval(async () => {
        const newQuote = await fetchQuoteFromEnabledSources();
        await updateQuoteOnGlasses(newQuote);
      }, 600000); // 10 minutes = 600000ms
    }

    // Update direction and distance every 2 seconds
    state.navigationInterval = setInterval(async () => {
      try {
        // During navigation, reuse last known location if GPS fails
        let currentLocation;
        try {
          currentLocation = await getUserLocation();
          state.userLocation = currentLocation;
        } catch (error) {
          console.warn('Location update failed, using last known location');
          currentLocation = state.userLocation;
          if (!currentLocation) return;
        }

        const [toLng, toLat] = state.selectedLocation.location.split(',');
        const { bearing, distance } = calculateDirection(
          currentLocation,
          { lng: toLng, lat: toLat }
        );

        const distanceText = formatDistance(distance);

        // If orientation available, show arrow; otherwise show bearing
        let displayText;
        if (state.currentHeading !== null) {
          const arrow = getDirectionArrow(bearing);
          displayText = `${arrow} ${distanceText}`;
        } else {
          displayText = `${Math.round(bearing)}° ${distanceText}`;
        }

        // Update glasses if connected, always log to console
        if (glassesConnected) {
          await updateGlassesDisplay(displayText);
        }
        console.log(`🧭 ${displayText} → ${state.selectedLocation.name}`);

        // Arrived (within 50m)
        if (distance < 50) {
          if (glassesConnected) {
            await updateGlassesDisplay('✓ Arrived');
          }
          console.log('✅ Arrived at destination!');
          updateStatus('Arrived!', 'success');
          setTimeout(() => stopNavigation(), 3000);
        }
      } catch (error) {
        console.error('Navigation update failed:', error);
      }
    }, 2000);

  } catch (error) {
    console.error('Failed to start navigation:', error);
    updateStatus(error.message || 'Location failed', 'error');
    state.isNavigating = false;
  }
}

// Stop navigation and restore welcome page
async function stopNavigation() {
  if (state.navigationInterval) {
    clearInterval(state.navigationInterval);
    state.navigationInterval = null;
  }
  if (state.quoteInterval) {
    clearInterval(state.quoteInterval);
    state.quoteInterval = null;
  }
  if (state.quoteRetryInterval) {
    clearInterval(state.quoteRetryInterval);
    state.quoteRetryInterval = null;
  }
  state.isNavigating = false;

  if (state.bridge && state.isConnected && state.pageCreated) {
    try {
      // Rebuild back to welcome layout (don't re-call createStartUpPageContainer)
      const result = await state.bridge.rebuildPageContainer(new RebuildPageContainer({
        containerTotalNum: 2,
        textObject: createWelcomeTextObjects(),
        imageObject: []
      }));

      if (result === 0) {
        console.log('Welcome page restored');
      }
    } catch (e) {
      console.error('Failed to restore welcome page:', e);
    }
  }

  // Update button based on whether location is selected
  if (state.selectedLocation) {
    setNavButtonContent('Start Navigation');
  } else {
    setNavButtonContent('Start Navigation');
  }
}

// Toggle navigation on/off
function toggleNavigation() {
  if (state.isNavigating) {
    stopNavigation();
  } else {
    // Show permission modal before starting navigation
    const permissionModal = document.getElementById('permissionModal');
    permissionModal.classList.remove('hidden');
  }
}

// --- UI Event Handling ---
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const resultsEl = document.getElementById('results');
  const navButton = document.getElementById('navButton');
  const mapTabs = document.querySelectorAll('.map-tab');
  const settingsButton = document.getElementById('settingsButton');
  const settingsPage = document.getElementById('settingsPage');
  const container = document.querySelector('.container');
  const aboutVersion = document.getElementById('aboutVersion');
  const philosophyToggle = document.getElementById('philosophyToggle');
  const durationButton = document.getElementById('durationButton');
  const durationValue = document.getElementById('durationValue');
  const durationModal = document.getElementById('durationModal');
  const modalOptions = document.querySelectorAll('#durationModal .modal-option');
  const modalCloseButton = document.getElementById('modalCloseButton');
  const modalConfirmButton = document.getElementById('modalConfirmButton');
  const stoicToggle = document.getElementById('stoicOption');
  const hitokotoToggle = document.getElementById('hitokotoOption');
  const permissionModal = document.getElementById('permissionModal');
  const permissionCancelBtn = document.getElementById('permissionCancelBtn');
  const permissionConfirmBtn = document.getElementById('permissionConfirmBtn');
                  const displayPositionButton = document.getElementById('displayPositionButton');
  const displayPositionValue = document.getElementById('displayPositionValue');
  const displayPositionModal = document.getElementById('displayPositionModal');
  const displayPositionModalOptions = document.querySelectorAll('#displayPositionModal .modal-option');
  const displayPositionModalCloseButton = document.getElementById('displayPositionModalCloseButton');
  const displayPositionModalConfirmButton = document.getElementById('displayPositionModalConfirmButton');

  aboutVersion.textContent = `MoonWalker v${APP_VERSION}`;

  let searchTimeout;
  let tempSelectedDuration = null; // Temporary selection before confirmation
  let tempSelectedDisplayPosition = null; // Temporary display position selection

  // Load settings
  loadNavigationHistory();
  loadPhilosophySetting();
  loadQuoteDurationSetting();
  loadContentSourcesSetting();
    loadDisplayPositionSetting();

  // Initialize orientation tracking
  initOrientation();

  // Update duration display
  function updateDurationDisplay() {
    if (state.quoteDuration === 'always') {
      durationValue.textContent = 'Always Show';
    } else {
      durationValue.textContent = `${state.quoteDuration}s`;
    }
  }

  // Initialize duration display
  updateDurationDisplay();

  // Render pixel-art toggle SVG (matches VoiceInk)
  function renderToggle(isOn) {
    const trackColor = isOn ? 'var(--toggle-track-on, #232323)' : 'var(--toggle-track-off, #E4E4E4)';
    const knobPath = isOn
      ? 'M29.25 19.5H21.75V18H19.5V15.75H18V8.25H19.5V6H21.75V4.5H29.25V6H31.5V8.25H33V15.75H31.5V18H29.25V19.5Z'
      : 'M14.25 19.5H6.75V18H4.5V15.75H3V8.25H4.5V6H6.75V4.5H14.25V6H16.5V8.25H18V15.75H16.5V18H14.25V19.5Z';

    return `<svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30.75 3H33V4.5H34.5V6.75H36V17.25H34.5V19.5H33V21H30.75V22.5H5.25V21H3V19.5H1.5V17.25H0V6.75H1.5V4.5H3V3H5.25V1.5H30.75V3Z" fill="${trackColor}" style="transition: fill 0.2s" />
      <path d="${knobPath}" fill="white" style="transition: d 0.2s" />
    </svg>`;
  }

  // Update toggle UI based on saved setting
  function updateToggleUI() {
    philosophyToggle.innerHTML = renderToggle(state.philosophyEnabled);
    philosophyToggle.dataset.enabled = state.philosophyEnabled ? 'true' : 'false';
  }

  // Initialize toggle UI
  updateToggleUI();

    
  // Update display position display
  function updateDisplayPositionDisplay() {
    const positionNames = { top: 'Top Left', middle: 'Middle Left', bottom: 'Bottom Left' };
    displayPositionValue.textContent = positionNames[state.displayPosition] || 'Top Left';
  }

  // Initialize display position UI
  updateDisplayPositionDisplay();

  // Update content source toggles UI
  function updateSourceTogglesUI() {
    const toggles = { stoic: stoicToggle, hitokoto: hitokotoToggle };
    Object.entries(toggles).forEach(([key, toggle]) => {
      const img = toggle.querySelector('img');
      if (state.contentSources[key]) {
        img.src = `${BASE}checked.svg`;
        toggle.dataset.checked = 'true';
      } else {
        img.src = `${BASE}unchecked.svg`;
        toggle.dataset.checked = 'false';
      }
    });
  }

  // Initialize source toggles UI
  updateSourceTogglesUI();

  // Content source toggle handlers
  [
    { toggle: stoicToggle, key: 'stoic' },
    { toggle: hitokotoToggle, key: 'hitokoto' }
  ].forEach(({ toggle, key }) => {
    toggle.addEventListener('click', () => {
      state.contentSources[key] = !state.contentSources[key];
      saveContentSourcesSetting();
      updateSourceTogglesUI();
    });
  });

  // Philosophy toggle handler
  philosophyToggle.addEventListener('click', async () => {
    state.philosophyEnabled = !state.philosophyEnabled;
    savePhilosophySetting();
    updateToggleUI();
    console.log('Philosophy quotes:', state.philosophyEnabled ? 'enabled' : 'disabled');

    // If currently navigating, apply changes immediately
    if (state.isNavigating) {
      if (state.philosophyEnabled) {
        // Enable: fetch and display quote
        try {
          const newQuote = await fetchQuoteFromEnabledSources();
          await updateQuoteOnGlasses(newQuote);

          // Start quote update interval
          if (!state.quoteInterval) {
            state.quoteInterval = setInterval(async () => {
              const quote = await fetchQuoteFromEnabledSources();
              await updateQuoteOnGlasses(quote);
            }, 600000); // 10 minutes
          }
        } catch (error) {
          console.error('Failed to fetch quote:', error);
        }
      } else {
        // Disable: clear quote and stop interval
        await updateQuoteOnGlasses('');

        if (state.quoteInterval) {
          clearInterval(state.quoteInterval);
          state.quoteInterval = null;
        }
        if (state.quoteRetryInterval) {
          clearInterval(state.quoteRetryInterval);
          state.quoteRetryInterval = null;
        }
      }
    }
  });

  // Display position button handler - open modal
  displayPositionButton.addEventListener('click', () => {
    tempSelectedDisplayPosition = state.displayPosition;
    displayPositionModal.classList.remove('hidden');

    displayPositionModalOptions.forEach(option => {
      const position = option.dataset.position;
      if (position === state.displayPosition) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  });

  // Display position modal option handlers
  displayPositionModalOptions.forEach(option => {
    option.addEventListener('click', () => {
      tempSelectedDisplayPosition = option.dataset.position;
      displayPositionModalOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    });
  });

  // Display position modal confirm
  displayPositionModalConfirmButton.addEventListener('click', async () => {
    if (tempSelectedDisplayPosition !== null) {
      state.displayPosition = tempSelectedDisplayPosition;
      saveDisplayPositionSetting();
      updateDisplayPositionDisplay();
      console.log('Display position set to:', state.displayPosition);

      // Apply immediately on G2 if connected
      if (state.bridge && state.isConnected && state.pageCreated) {
        try {
          const offsets = getDisplayOffsets();
          if (state.isNavigating) {
            // Rebuild navigation page with new position
            const arrowImageContainer = new ImageContainerProperty({
              xPosition: 20,
              yPosition: offsets.navArrow,
              width: 28,
              height: 28,
              containerID: 1001,
              containerName: 'arrow'
            });
            await state.bridge.rebuildPageContainer(new RebuildPageContainer({
              containerTotalNum: 3,
              textObject: [
                {
                  xPosition: 72,
                  yPosition: offsets.navDistance,
                  width: 330,
                  height: 80,
                  borderWidth: 0,
                  borderColor: 0,
                  borderRadius: 0,
                  paddingLength: 0,
                  containerID: 1002,
                  containerName: 'distance',
                  isEventCapture: 1,
                  content: 'Navigating...'
                },
                {
                  xPosition: 20,
                  yPosition: offsets.navQuote,
                  width: 480,
                  height: 60,
                  borderWidth: 0,
                  borderColor: 0,
                  borderRadius: 0,
                  paddingLength: 0,
                  containerID: 1003,
                  containerName: 'quote',
                  isEventCapture: 0,
                  content: ''
                }
              ],
              imageObject: [arrowImageContainer]
            }));
            const arrowIconData = await loadArrowIcon();
            if (arrowIconData) {
              await state.bridge.updateImageRawData({
                containerID: 1001,
                containerName: 'arrow',
                imageData: arrowIconData
              });
            }
          } else {
            // Preview: rebuild with sample nav layout so user can see position
            const arrowImageContainer = new ImageContainerProperty({
              xPosition: 20,
              yPosition: offsets.navArrow,
              width: 28,
              height: 28,
              containerID: 1001,
              containerName: 'arrow'
            });
            await state.bridge.rebuildPageContainer(new RebuildPageContainer({
              containerTotalNum: 2,
              textObject: [
                {
                  xPosition: 72,
                  yPosition: offsets.navDistance,
                  width: 330,
                  height: 80,
                  borderWidth: 0,
                  borderColor: 0,
                  borderRadius: 0,
                  paddingLength: 0,
                  containerID: 1002,
                  containerName: 'distance',
                  isEventCapture: 0,
                  content: '120m'
                }
              ],
              imageObject: [arrowImageContainer]
            }));
            const arrowIconData = await loadArrowIcon();
            if (arrowIconData) {
              await state.bridge.updateImageRawData({
                containerID: 1001,
                containerName: 'arrow',
                imageData: arrowIconData
              });
            }
            // Restore welcome page after 3 seconds
            setTimeout(async () => {
              if (!state.isNavigating && state.bridge && state.isConnected) {
                try {
                  await state.bridge.rebuildPageContainer(new RebuildPageContainer({
                    containerTotalNum: 2,
                    textObject: createWelcomeTextObjects(),
                    imageObject: []
                  }));
                } catch (e) {
                  console.error('Failed to restore welcome page:', e);
                }
              }
            }, 3000);
          }
        } catch (e) {
          console.error('Failed to rebuild page with new position:', e);
        }
      }
    }
    displayPositionModal.classList.add('hidden');
  });

  // Close display position modal
  displayPositionModal.addEventListener('click', (e) => {
    if (e.target === displayPositionModal) {
      displayPositionModal.classList.add('hidden');
      tempSelectedDisplayPosition = null;
    }
  });

  displayPositionModalCloseButton.addEventListener('click', () => {
    displayPositionModal.classList.add('hidden');
    tempSelectedDisplayPosition = null;
  });

  // Settings modal
  settingsButton.addEventListener('click', () => {
    settingsPage.classList.remove('hidden');
  });

  // Close settings when clicking overlay background
  settingsPage.addEventListener('click', (e) => {
    if (e.target === settingsPage) {
      settingsPage.classList.add('hidden');
    }
  });

  // Duration button handler - open modal
  durationButton.addEventListener('click', () => {
    // Initialize temp selection with current value
    tempSelectedDuration = state.quoteDuration;
    durationModal.classList.remove('hidden');

    // Update selected state based on current saved value
    modalOptions.forEach(option => {
      const duration = option.dataset.duration;
      if (duration === String(state.quoteDuration)) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  });

  // Modal option handlers - only update temp selection
  modalOptions.forEach(option => {
    option.addEventListener('click', () => {
      const duration = option.dataset.duration;
      tempSelectedDuration = duration === 'always' ? 'always' : parseInt(duration);

      // Update UI to show selection
      modalOptions.forEach(opt => {
        if (opt.dataset.duration === duration) {
          opt.classList.add('selected');
        } else {
          opt.classList.remove('selected');
        }
      });
    });
  });

  // Confirm button handler - apply the selection
  modalConfirmButton.addEventListener('click', () => {
    if (tempSelectedDuration !== null) {
      state.quoteDuration = tempSelectedDuration;
      saveQuoteDurationSetting();
      updateDurationDisplay();
      console.log('Quote duration set to:', state.quoteDuration);
    }
    durationModal.classList.add('hidden');
  });

  // Close modal when clicking overlay - discard selection
  durationModal.addEventListener('click', (e) => {
    if (e.target === durationModal) {
      durationModal.classList.add('hidden');
      tempSelectedDuration = null;
    }
  });

  // Close modal when clicking close button - discard selection
  modalCloseButton.addEventListener('click', () => {
    durationModal.classList.add('hidden');
    tempSelectedDuration = null;
  });

  // Display navigation history on load
  function displayNavigationHistory() {
    if (state.navigationHistory.length === 0) {
      resultsEl.classList.add('empty');
      resultsEl.innerHTML = `
        <div class="empty-state">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M27 27H24V24H27V27ZM24 24H21V21H24V24ZM21 21H18V18H21V21ZM16 20H9V18H16V20ZM9 18H7V16H9V18ZM18 18H16V16H18V18ZM7 16H5V9H7V16ZM20 16H18V9H20V16ZM9 9H7V7H9V9ZM18 9H16V7H18V9ZM16 7H9V5H16V7Z" fill="currentColor"/>
          </svg>
          <p>No search record</p>
        </div>
      `;
    } else {
      resultsEl.classList.remove('empty');
      resultsEl.innerHTML = state.navigationHistory.map((result, index) => `
        <div class="result-item" data-index="${index}">
          <svg class="result-item-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.75 22.5H11.25V21H12.75V22.5ZM11.25 21H9.75V19.5H11.25V21ZM14.25 21H12.75V19.5H14.25V21ZM9.75 19.5H8.25V18H9.75V19.5ZM15.75 19.5H14.25V18H15.75V19.5ZM8.25 18H6.75V15.75H8.25V18ZM17.25 18H15.75V15.75H17.25V18ZM6.75 15.75H5.25V13.5H6.75V15.75ZM18.75 15.75H17.25V13.5H18.75V15.75ZM5.25 13.5H3.75V6H5.25V13.5ZM14.25 13.5H9.75V12H14.25V13.5ZM20.25 13.5H18.75V6H20.25V13.5ZM9.75 12H8.25V7.5H9.75V12ZM15.75 12H14.25V7.5H15.75V12ZM14.25 7.5H9.75V6H14.25V7.5ZM6.75 6H5.25V4.5H6.75V6ZM18.75 6H17.25V4.5H18.75V6ZM8.25 4.5H6.75V3H8.25V4.5ZM17.25 4.5H15.75V3H17.25V4.5ZM15.75 3H8.25V1.5H15.75V3Z" fill="currentColor"/>
          </svg>
          <div class="result-item-content">
            <div class="result-name">${result.name}</div>
            <div class="result-address">${result.address}</div>
          </div>
          <img src="${BASE}check-icon.svg" class="result-item-check" width="24" height="24">
        </div>
      `).join('');

      // Add click handlers for history items
      resultsEl.querySelectorAll('.result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
          state.selectedLocation = state.navigationHistory[index];
          navButton.disabled = false;
          setNavButtonContent('Start Navigation');

          // Highlight selected item
          resultsEl.querySelectorAll('.result-item').forEach(el => {
            el.classList.remove('selected');
          });
          item.classList.add('selected');
        });
      });
    }
  }

  // Display history on load
  displayNavigationHistory();

  // Map service tab switching
  mapTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mapTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      state.mapService = tab.dataset.service;

      // Clear search input and show navigation history on tab switch
      searchInput.value = '';
      displayNavigationHistory();

      console.log('Map service switched to:', state.mapService);
    });
  });

  // Search input with debounce
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const keyword = e.target.value;
      if (!keyword.trim()) {
        // Show navigation history when search is empty
        displayNavigationHistory();
        return;
      }

      // Call the appropriate API based on selected service
      const results = state.mapService === 'amap'
        ? await searchLocation(keyword)
        : await searchLocationPhoton(keyword);

      if (results.length === 0) {
        resultsEl.classList.add('empty');
        resultsEl.innerHTML = `
          <div class="empty-state secondary">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M27 27H24V24H27V27ZM24 24H21V21H24V24ZM21 21H18V18H21V21ZM16 20H9V18H16V20ZM9 18H7V16H9V18ZM18 18H16V16H18V18ZM7 16H5V9H7V16ZM20 16H18V9H20V16ZM9 9H7V7H9V9ZM18 9H16V7H18V9ZM16 7H9V5H16V7Z" fill="currentColor"/>
            </svg>
            <p>No results found</p>
          </div>
        `;
        return;
      }

      resultsEl.classList.remove('empty');
      resultsEl.innerHTML = results.map((result, index) => `
        <div class="result-item" data-index="${index}">
          <svg class="result-item-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.75 22.5H11.25V21H12.75V22.5ZM11.25 21H9.75V19.5H11.25V21ZM14.25 21H12.75V19.5H14.25V21ZM9.75 19.5H8.25V18H9.75V19.5ZM15.75 19.5H14.25V18H15.75V19.5ZM8.25 18H6.75V15.75H8.25V18ZM17.25 18H15.75V15.75H17.25V18ZM6.75 15.75H5.25V13.5H6.75V15.75ZM18.75 15.75H17.25V13.5H18.75V15.75ZM5.25 13.5H3.75V6H5.25V13.5ZM14.25 13.5H9.75V12H14.25V13.5ZM20.25 13.5H18.75V6H20.25V13.5ZM9.75 12H8.25V7.5H9.75V12ZM15.75 12H14.25V7.5H15.75V12ZM14.25 7.5H9.75V6H14.25V7.5ZM6.75 6H5.25V4.5H6.75V6ZM18.75 6H17.25V4.5H18.75V6ZM8.25 4.5H6.75V3H8.25V4.5ZM17.25 4.5H15.75V3H17.25V4.5ZM15.75 3H8.25V1.5H15.75V3Z" fill="currentColor"/>
          </svg>
          <div class="result-item-content">
            <div class="result-name">${result.name}</div>
            <div class="result-address">${result.address}</div>
          </div>
          <img src="${BASE}check-icon.svg" class="result-item-check" width="24" height="24">
        </div>
      `).join('');

      // Result item click handler
      resultsEl.querySelectorAll('.result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
          state.selectedLocation = results[index];
          navButton.disabled = false;
          setNavButtonContent('Start Navigation');

          // Highlight selected item
          resultsEl.querySelectorAll('.result-item').forEach(el => {
            el.classList.remove('selected');
          });
          item.classList.add('selected');
        });
      });
    }, 500);
  });

  // Navigation button
  navButton.addEventListener('click', toggleNavigation);

  // Permission modal handlers
  permissionCancelBtn.addEventListener('click', () => {
    permissionModal.classList.add('hidden');
  });

  permissionConfirmBtn.addEventListener('click', async () => {
    permissionModal.classList.add('hidden');

    // Request orientation permission (iOS 13+)
    await initOrientation();

    // Try to get location and start navigation
    try {
      const location = await getUserLocation();
      state.userLocation = location;
      await startNavigationCore();
    } catch (error) {
      console.error('Location failed:', error);
      showLocationFailedCard();
    }
  });

  // Initialize bridge
  initBridge();

  // Clean up G2 display on page exit
  window.addEventListener('beforeunload', () => {
    if (state.bridge && state.isConnected) {
      state.bridge.shutDownPageContainer(0);
    }
  });
});
