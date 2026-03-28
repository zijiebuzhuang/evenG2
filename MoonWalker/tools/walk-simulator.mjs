#!/usr/bin/env node
/**
 * Walk Simulator — Simulates walking from point A to point B
 * Uses Chrome DevTools Protocol to override geolocation in real-time.
 *
 * Prerequisites:
 *   1. Start Chrome with remote debugging:
 *      /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
 *        --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
 *   2. Open http://localhost:5173 in that Chrome
 *   3. Run this script:
 *      node tools/walk-simulator.mjs [--speed 1.4] [--from lat,lng] [--to lat,lng]
 *
 * The script will:
 *   - Connect to Chrome and grant geolocation permission
 *   - Set initial GPS position and reload the page
 *   - Wait for you to search a destination and start navigation
 *   - Press Enter to begin simulated walking
 *
 * Defaults: Walks from Tian'anmen Square to the Forbidden City entrance (~1.2km)
 */

const DEFAULT_FROM = { lat: 39.9054, lng: 116.3976 };  // Tian'anmen
const DEFAULT_TO   = { lat: 39.9163, lng: 116.3972 };  // Forbidden City north gate
const DEFAULT_SPEED = 1.4; // m/s (~5 km/h walking speed)
const UPDATE_INTERVAL_MS = 1000; // Update position every second

// --- Parse CLI args ---
const args = process.argv.slice(2);
let from = DEFAULT_FROM;
let to = DEFAULT_TO;
let speed = DEFAULT_SPEED;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from' && args[i + 1]) {
    const [lat, lng] = args[++i].split(',').map(Number);
    from = { lat, lng };
  } else if (args[i] === '--to' && args[i + 1]) {
    const [lat, lng] = args[++i].split(',').map(Number);
    to = { lat, lng };
  } else if (args[i] === '--speed' && args[i + 1]) {
    speed = parseFloat(args[++i]);
  }
}

// --- Haversine distance (meters) ---
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Calculate bearing (degrees) ---
function bearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

// --- Wait for Enter key ---
function waitForEnter(prompt) {
  return new Promise(resolve => {
    process.stdout.write(prompt);
    process.stdin.setRawMode?.(false);
    process.stdin.resume();
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });
}

// --- Connect to Chrome DevTools Protocol ---
async function getWebSocketUrl() {
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('localhost:5173'));
  if (!target) {
    console.error('No tab found with localhost:5173. Open it in the debug Chrome first.');
    process.exit(1);
  }
  return target.webSocketDebuggerUrl;
}

async function main() {
  const totalDistance = haversine(from.lat, from.lng, to.lat, to.lng);
  const totalSteps = Math.ceil(totalDistance / (speed * UPDATE_INTERVAL_MS / 1000));
  const dLat = (to.lat - from.lat) / totalSteps;
  const dLng = (to.lng - from.lng) / totalSteps;

  console.log(`\n🚶 Walk Simulator`);
  console.log(`   From: ${from.lat}, ${from.lng}`);
  console.log(`   To:   ${to.lat}, ${to.lng}`);
  console.log(`   Distance: ${totalDistance.toFixed(0)}m | Speed: ${speed} m/s | ETA: ${(totalDistance / speed / 60).toFixed(1)} min`);
  console.log(`   Steps: ${totalSteps} (updating every ${UPDATE_INTERVAL_MS / 1000}s)\n`);

  // Connect to Chrome
  console.log('Connecting to Chrome DevTools...');
  const wsUrl = await getWebSocketUrl();

  const ws = new WebSocket(wsUrl);
  let msgId = 1;

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  console.log('Connected!\n');

  // Step 1: Grant geolocation permission
  await send('Browser.grantPermissions', {
    permissions: ['geolocation'],
    origin: 'http://localhost:5173'
  });
  console.log('✅ Geolocation permission granted');

  // Step 2: Set initial GPS position
  await send('Emulation.setGeolocationOverride', {
    latitude: from.lat,
    longitude: from.lng,
    accuracy: 10
  });
  console.log(`📍 Initial position set: ${from.lat}, ${from.lng}`);

  // Step 3: Reload page so it picks up the new location
  await send('Page.reload', {});
  console.log('🔄 Page reloaded\n');

  // Step 4: Wait for user to interact with the app
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Now go to the Chrome window:');
  console.log('  1. Search for a destination');
  console.log('  2. Select it and click "Start Navigation"');
  console.log('  3. Come back here and press Enter');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await waitForEnter('Press Enter to start walking... ');

  console.log('\n🏃 Walking started!\n');

  let step = 0;

  const interval = setInterval(() => {
    step++;
    if (step > totalSteps) {
      clearInterval(interval);
      console.log('\n\n✅ Arrived at destination!');
      // Keep connection open for a few seconds so the app can show final state
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 5000);
      return;
    }

    const lat = from.lat + dLat * step;
    const lng = from.lng + dLng * step;
    const remaining = haversine(lat, lng, to.lat, to.lng);
    const heading = bearing(lat, lng, to.lat, to.lng);

    // Keep overriding geolocation (fire-and-forget, connection stays open)
    ws.send(JSON.stringify({
      id: msgId++,
      method: 'Emulation.setGeolocationOverride',
      params: { latitude: lat, longitude: lng, accuracy: 10 }
    }));

    // Clear line and print progress
    const progress = Math.round((step / totalSteps) * 100);
    const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    process.stdout.write(`\r  ${bar} ${progress}% | ${remaining.toFixed(0)}m left | heading ${heading.toFixed(0)}° | (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
  }, UPDATE_INTERVAL_MS);
}

main().catch(err => {
  console.error('Error:', err.message);
  console.log('\nMake sure Chrome is running with --remote-debugging-port=9222');
  console.log('Example:');
  console.log('  /Applications/Google\\\\ Chrome.app/Contents/MacOS/Google\\\\ Chrome \\\\');
  console.log('    --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug');
  process.exit(1);
});
