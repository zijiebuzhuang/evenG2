import { waitForEvenAppBridge, ImageContainerProperty, RebuildPageContainer } from '@evenrealities/even_hub_sdk';

// Amap API Key (from environment variable)
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;

// --- SVG Icon Constants ---
const ICON_NAV_ARROW = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 21.75H12V20.25H13.5V21.75ZM15 20.25H13.5V18.75H15V20.25ZM16.5 18.75H15V17.25H16.5V18.75ZM18 17.25H16.5V15.75H18V17.25ZM19.5 15.75H18V14.25H19.5V15.75ZM21 14.25H19.5V12.75H21V14.25ZM19.5 12.75H1.5V11.25H19.5V12.75ZM22.5 11.25V12.75H21V11.25H22.5ZM21 11.25H19.5V9.75H21V11.25ZM19.5 9.75H18V8.25H19.5V9.75ZM18 8.25H16.5V6.75H18V8.25ZM16.5 6.75H15V5.25H16.5V6.75ZM15 5.25H13.5V3.75H15V5.25ZM13.5 3.75H12V2.25H13.5V3.75Z" fill="white"/>
  </svg>`;

const ICON_CANCEL = `
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_cancel)">
      <path d="M22 27H10V25H22V27ZM24 25H22V23H24V25ZM26 23H24V15H26V23ZM14 19H12V17H14V19ZM12 17H10V15H12V17ZM10 15H8V13H10V15ZM24 15H22V13H24V15ZM8 13H6V11H8V13ZM22 13H10V11H22V13ZM10 11H8V9H10V11ZM12 9H10V7H12V9ZM14 7H12V5H14V7Z" fill="white"/>
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

// --- Welcome Page Layout Config ---
const WELCOME_TEXT_OBJECTS = [
  {
    xPosition: 20,
    yPosition: 20,
    width: 350,
    height: 80,
    borderWidth: 0,
    borderColor: 0,
    borderRdaius: 0,
    paddingLength: 0,
    containerID: 1001,
    containerName: 'title',
    isEventCapture: 0,
    content: 'MoonWalker'
  },
  {
    xPosition: 20,
    yPosition: 80,
    width: 350,
    height: 150,
    borderWidth: 0,
    borderColor: 0,
    borderRdaius: 0,
    paddingLength: 0,
    containerID: 1002,
    containerName: 'intro',
    isEventCapture: 1,
    content: 'Navigate with clarity. Arrows point the way, distance keeps you informed. Search and go.'
  }
];

function createWelcomeImageObject() {
  return new ImageContainerProperty({
    xPosition: 430,
    yPosition: 90,
    width: 70,
    height: 70,
    containerID: 1003,
    containerName: 'icon'
  });
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
    typefit: false,
    hitokoto: false,
    zenquotes: false
  }
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

// Fetch stoic quote from stoic-quotes.com
async function fetchStoicQuote() {
  const response = await fetch('https://stoic-quotes.com/api/quote');
  if (!response.ok) throw new Error('Stoic API failed');
  const data = await response.json();
  return `"${data.text}" — ${data.author}`;
}

// Fetch quote from type.fit
async function fetchTypefitQuote() {
  const response = await fetch('https://type.fit/api/quotes');
  if (!response.ok) throw new Error('Type.fit API failed');
  const data = await response.json();
  const item = data[Math.floor(Math.random() * data.length)];
  const author = item.author ? ` — ${item.author.replace(', type.fit', '')}` : '';
  return `"${item.text}"${author}`;
}

// Fetch quote from hitokoto (anime/literary quotes)
async function fetchHitokotoQuote() {
  const response = await fetch('https://v1.hitokoto.cn/?c=i&c=k');
  if (!response.ok) throw new Error('Hitokoto API failed');
  const data = await response.json();
  const author = data.from ? ` — ${data.from}` : '';
  return `"${data.hitokoto}"${author}`;
}

// Fetch quote from zenquotes
async function fetchZenquoteQuote() {
  const response = await fetch('https://zenquotes.io/api/random');
  if (!response.ok) throw new Error('ZenQuotes API failed');
  const data = await response.json();
  return `"${data[0].q}" — ${data[0].a}`;
}

// Pick a random enabled source and fetch a quote
async function fetchQuoteFromEnabledSources() {
  const enabled = Object.entries(state.contentSources)
    .filter(([, on]) => on)
    .map(([key]) => key);

  if (enabled.length === 0) return '';

  const source = enabled[Math.floor(Math.random() * enabled.length)];

  switch (source) {
    case 'stoic':     return await fetchStoicQuote();
    case 'typefit':   return await fetchTypefitQuote();
    case 'hitokoto':  return await fetchHitokotoQuote();
    case 'zenquotes': return await fetchZenquoteQuote();
    default:          return '';
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

// Load and convert icon image to base64, scaled to container size
async function loadIconImage() {
  try {
    const response = await fetch('/moonwalker-icon.png');
    if (!response.ok) {
      console.error('Failed to fetch icon:', response.status);
      return null;
    }
    const blob = await response.blob();
    console.log('Icon blob size:', blob.size, 'type:', blob.type);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('Original image size:', img.width, 'x', img.height);

        // Create 70x70 canvas (matching container size)
        const canvas = document.createElement('canvas');
        canvas.width = 70;
        canvas.height = 70;
        const ctx = canvas.getContext('2d');

        // Draw scaled image (preserve transparency)
        ctx.drawImage(img, 0, 0, 70, 70);

        // Convert to PNG base64
        const base64 = canvas.toDataURL('image/png');
        console.log('Processed icon (70x70), base64 length:', base64.length);

        // Strip data:image/png;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Failed to load icon:', error);
    return null;
  }
}

// Load and convert navigation icon (SVG to base64)
async function loadNavIcon() {
  try {
    const response = await fetch('/nav-icon.svg');
    if (!response.ok) {
      console.error('Failed to fetch nav icon:', response.status);
      return null;
    }
    const svgText = await response.text();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Create 32x32 canvas
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Fill white background to prevent transparency issues
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 32, 32);

        // Draw SVG
        ctx.drawImage(img, 0, 0, 32, 32);

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
    console.error('Failed to load nav icon:', error);
    return null;
  }
}

// Load arrow icon for navigation
async function loadArrowIcon() {
  try {
    const response = await fetch('/arrow-icon.svg');
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

// Load and display icon on the glasses
async function loadAndDisplayIcon() {
  const iconData = await loadIconImage();
  if (iconData) {
    console.log('Loading icon, data length:', iconData.length);
    const imageResult = await state.bridge.updateImageRawData({
      containerID: 1003,
      containerName: 'icon',
      imageData: iconData
    });
    console.log('Icon update result:', imageResult);
  } else {
    console.error('Failed to load icon data');
  }
}

// Create initial welcome page on glasses
async function createInitialPage() {
  try {
    console.log('createInitialPage called, isConnected:', state.isConnected, 'pageCreated:', state.pageCreated);

    // First try to clear any existing page
    try {
      await state.bridge.clearStartUpPageContainer();
      console.log('Cleared existing page');
    } catch (e) {
      console.log('No existing page to clear or clear failed:', e);
    }

    const result = await state.bridge.createStartUpPageContainer({
      containerTotalNum: 3,
      textObject: WELCOME_TEXT_OBJECTS,
      imageObject: [createWelcomeImageObject()]
    });

    console.log('createStartUpPageContainer result:', result);
    if (result === 0) {
      state.pageCreated = true;
      console.log('Initial page created successfully, pageCreated:', state.pageCreated);
      await loadAndDisplayIcon();
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

// Get user's current location
async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback: use Apple Park coordinates
      console.warn('Geolocation not supported, using mock location (Apple Park)');
      resolve({ lng: -122.009, lat: 37.3349 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lng: position.coords.longitude,
          lat: position.coords.latitude
        });
      },
      (error) => {
        // Fallback on geolocation failure
        console.warn('Geolocation failed, using mock location (Apple Park):', error);
        resolve({ lng: -122.009, lat: 37.3349 });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 5000
      }
    );
  });
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
function getDirectionArrow(bearing) {
  const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
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
    const arrowImageContainer = new ImageContainerProperty({
      xPosition: 20,
      yPosition: 20,
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
          yPosition: 20,
          width: 330,
          height: 80,
          borderWidth: 0,
          borderColor: 0,
          borderRdaius: 0,
          paddingLength: 0,
          containerID: 1002,
          containerName: 'distance',
          isEventCapture: 1,
          content: 'Calculating...'
        },
        {
          xPosition: 20,
          yPosition: 220,
          width: 480,
          height: 60,
          borderWidth: 0,
          borderColor: 0,
          borderRdaius: 0,
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
async function updateGlassesDisplay(arrow, distance) {
  if (!state.bridge || !state.isConnected || !state.pageCreated) return;

  try {
    await state.bridge.textContainerUpgrade({
      containerID: 1002,
      containerName: 'distance',
      contentOffset: 0,
      contentLength: 50,
      content: distance
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

// Start navigation to selected location
async function startNavigation() {
  if (!state.selectedLocation) return;

  try {
    if (!state.bridge || !state.isConnected) {
      updateStatus('Glasses disconnected', 'error');
      return;
    }

    if (!state.pageCreated) {
      await createInitialPage();
      if (!state.pageCreated) {
        updateStatus('Initialization failed', 'error');
        return;
      }
    }

    // Add to navigation history
    addToNavigationHistory(state.selectedLocation);

    updateStatus('Getting location...', 'navigating');
    state.userLocation = await getUserLocation();
    state.isNavigating = true;

    // Update button to show "Cancel Navigation"
    setNavButtonContent('Cancel Navigation', true);

    updateStatus('Navigating', 'navigating');
    await switchToNavigationMode();

    // Update quote every 10 minutes (only if philosophy is enabled)
    if (state.philosophyEnabled) {
      state.quoteInterval = setInterval(async () => {
        const newQuote = await fetchQuoteFromEnabledSources();
        await updateQuoteOnGlasses(newQuote);
      }, 600000); // 10 minutes = 600000ms
    }

    // Update direction and distance every 2 seconds
    state.navigationInterval = setInterval(async () => {
      try {
        const currentLocation = await getUserLocation();
        state.userLocation = currentLocation;

        const [toLng, toLat] = state.selectedLocation.location.split(',');
        const { bearing, distance } = calculateDirection(
          currentLocation,
          { lng: toLng, lat: toLat }
        );

        const arrow = getDirectionArrow(bearing);
        const distanceText = formatDistance(distance);

        await updateGlassesDisplay(arrow, distanceText);

        // Arrived (within 50m)
        if (distance < 50) {
          await updateGlassesDisplay('✓', 'Arrived');
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
    // Rebuild page with welcome layout (including icon image)
    await state.bridge.rebuildPageContainer(new RebuildPageContainer({
      containerTotalNum: 3,
      textObject: WELCOME_TEXT_OBJECTS,
      imageObject: [createWelcomeImageObject()]
    }));

    // Reload icon
    await loadAndDisplayIcon();
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
    startNavigation();
  }
}

// --- UI Event Handling ---
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const resultsEl = document.getElementById('results');
  const navButton = document.getElementById('navButton');
  const mapTabs = document.querySelectorAll('.map-tab');
  const settingsButton = document.getElementById('settingsButton');
  const backButton = document.getElementById('backButton');
  const settingsPage = document.getElementById('settingsPage');
  const container = document.querySelector('.container');
  const philosophyToggle = document.getElementById('philosophyToggle');
  const durationButton = document.getElementById('durationButton');
  const durationValue = document.getElementById('durationValue');
  const durationModal = document.getElementById('durationModal');
  const modalOptions = document.querySelectorAll('.modal-option');
  const modalCloseButton = document.getElementById('modalCloseButton');
  const modalConfirmButton = document.getElementById('modalConfirmButton');
  const stoicToggle = document.getElementById('stoicOption');
  const typefitToggle = document.getElementById('typefitOption');
  const hitokotoToggle = document.getElementById('hitokotoOption');
  const zenquotesToggle = document.getElementById('zenquotesOption');

  let searchTimeout;
  let tempSelectedDuration = null; // Temporary selection before confirmation

  // Load settings
  loadNavigationHistory();
  loadPhilosophySetting();
  loadQuoteDurationSetting();
  loadContentSourcesSetting();

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

  // Update toggle UI based on saved setting
  function updateToggleUI() {
    const toggleImg = philosophyToggle.querySelector('img');
    if (state.philosophyEnabled) {
      toggleImg.src = '/toggle-on.svg';
      philosophyToggle.dataset.enabled = 'true';
    } else {
      toggleImg.src = '/toggle-off.svg';
      philosophyToggle.dataset.enabled = 'false';
    }
  }

  // Initialize toggle UI
  updateToggleUI();

  // Update content source toggles UI
  function updateSourceTogglesUI() {
    const toggles = { stoic: stoicToggle, typefit: typefitToggle, hitokoto: hitokotoToggle, zenquotes: zenquotesToggle };
    Object.entries(toggles).forEach(([key, toggle]) => {
      const img = toggle.querySelector('img');
      if (state.contentSources[key]) {
        img.src = '/checked.svg';
        toggle.dataset.checked = 'true';
      } else {
        img.src = '/unchecked.svg';
        toggle.dataset.checked = 'false';
      }
    });
  }

  // Initialize source toggles UI
  updateSourceTogglesUI();

  // Content source toggle handlers
  [
    { toggle: stoicToggle, key: 'stoic' },
    { toggle: typefitToggle, key: 'typefit' },
    { toggle: hitokotoToggle, key: 'hitokoto' },
    { toggle: zenquotesToggle, key: 'zenquotes' }
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

  // Settings page navigation
  settingsButton.addEventListener('click', () => {
    container.style.display = 'none';
    settingsPage.classList.remove('hidden');
  });

  backButton.addEventListener('click', () => {
    settingsPage.classList.add('hidden');
    container.style.display = 'flex';
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
            <path d="M12.75 22.5H11.25V21H12.75V22.5ZM11.25 21H9.75V19.5H11.25V21ZM14.25 21H12.75V19.5H14.25V21ZM9.75 19.5H8.25V18H9.75V19.5ZM15.75 19.5H14.25V18H15.75V19.5ZM8.25 18H6.75V15.75H8.25V18ZM17.25 18H15.75V15.75H17.25V18ZM6.75 15.75H5.25V13.5H6.75V15.75ZM18.75 15.75H17.25V13.5H18.75V15.75ZM5.25 13.5H3.75V6H5.25V13.5ZM14.25 13.5H9.75V12H14.25V13.5ZM20.25 13.5H18.75V6H20.25V13.5ZM9.75 12H8.25V7.5H9.75V12ZM15.75 12H14.25V7.5H15.75V12ZM14.25 7.5H9.75V6H14.25V7.5ZM6.75 6H5.25V4.5H6.75V6ZM18.75 6H17.25V4.5H18.75V6ZM8.25 4.5H6.75V3H8.25V4.5ZM17.25 4.5H15.75V3H17.25V4.5ZM15.75 3H8.25V1.5H15.75V3Z" fill="#232323"/>
          </svg>
          <div class="result-item-content">
            <div class="result-name">${result.name}</div>
            <div class="result-address">${result.address}</div>
          </div>
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
            <path d="M12.75 22.5H11.25V21H12.75V22.5ZM11.25 21H9.75V19.5H11.25V21ZM14.25 21H12.75V19.5H14.25V21ZM9.75 19.5H8.25V18H9.75V19.5ZM15.75 19.5H14.25V18H15.75V19.5ZM8.25 18H6.75V15.75H8.25V18ZM17.25 18H15.75V15.75H17.25V18ZM6.75 15.75H5.25V13.5H6.75V15.75ZM18.75 15.75H17.25V13.5H18.75V15.75ZM5.25 13.5H3.75V6H5.25V13.5ZM14.25 13.5H9.75V12H14.25V13.5ZM20.25 13.5H18.75V6H20.25V13.5ZM9.75 12H8.25V7.5H9.75V12ZM15.75 12H14.25V7.5H15.75V12ZM14.25 7.5H9.75V6H14.25V7.5ZM6.75 6H5.25V4.5H6.75V6ZM18.75 6H17.25V4.5H18.75V6ZM8.25 4.5H6.75V3H8.25V4.5ZM17.25 4.5H15.75V3H17.25V4.5ZM15.75 3H8.25V1.5H15.75V3Z" fill="#232323"/>
          </svg>
          <div class="result-item-content">
            <div class="result-name">${result.name}</div>
            <div class="result-address">${result.address}</div>
          </div>
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

  // Initialize bridge
  initBridge();
});
