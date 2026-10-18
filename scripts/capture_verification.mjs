import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\fe77cb46-55c3-491a-b67f-2da18880f2ac';

async function capture(name, width, height, url, waitForMs = 2500) {
  const tempDir = path.join(process.env.TEMP, `chrome_cdp_${Math.random().toString(36).substring(2, 8)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const port = 9222 + Math.floor(Math.random() * 500);
  const proc = spawn(chromePath, [
    '--headless=new',
    '--enable-webgl',
    '--use-gl=angle',
    '--no-sandbox',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    `--window-size=${width},${height}`,
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    proc.kill();
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
    throw new Error('Failed to connect to Chrome CDP');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(res => ws.onopen = res);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  const sendSession = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, sessionId, method, params }));
  });

  await sendSession('Page.enable');
  await sendSession('Network.enable');

  // Set admin session cookie
  await sendSession('Network.setCookie', {
    name: 'mess_rush_session',
    value: encodeURIComponent(JSON.stringify({ role: 'admin', name: 'Campus Admin' })),
    domain: 'localhost',
    path: '/',
  });

  await sendSession('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });

  console.log(`Navigating to ${url} for ${name}...`);
  await sendSession('Page.navigate', { url });
  await new Promise(r => setTimeout(r, waitForMs));

  const shot = await sendSession('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log(`✓ Saved ${name}.png (${width}x${height})`);

  ws.close();
  proc.kill();
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
}

async function run() {
  await capture('verify_admin_menu_1440', 1440, 900, 'http://localhost:3000/admin/menu', 2500);
  await capture('verify_admin_data_1440', 1440, 900, 'http://localhost:3000/admin/data', 2500);
  await capture('verify_admin_pilot_1440', 1440, 900, 'http://localhost:3000/admin/pilot', 2500);
  console.log('ADMIN SCREENSHOTS COMPLETE!');
}

run();
