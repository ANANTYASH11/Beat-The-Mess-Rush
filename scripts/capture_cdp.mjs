import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\fe77cb46-55c3-491a-b67f-2da18880f2ac';

async function capture(name, width, height, url) {
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

  const { targetId } = await send('Target.createTarget', { url });
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
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });

  // Wait for canvas element to exist
  console.log(`Waiting for WebGL canvas on ${name}...`);
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 250));
    const evalRes = await sendSession('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("canvas"))',
      returnByValue: true,
    });
    if (evalRes?.result?.value) {
      break;
    }
  }

  // Wait 1.5s for Three.js textures and lighting to fully stabilize
  await new Promise(r => setTimeout(r, 1500));

  const shot = await sendSession('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log(`Success: ${name}.png saved (${fs.statSync(outPath).size} bytes)`);

  ws.close();
  proc.kill();
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}
}

async function run() {
  console.log('Starting screenshot captures...');
  // 1. LIGHT MODE (Default)
  await capture('home_1440_light', 1440, 900, 'http://localhost:3000');
  await capture('home_1024_light', 1024, 768, 'http://localhost:3000');
  await capture('home_375_light', 375, 812, 'http://localhost:3000');
  await capture('thalilab_1440_light', 1440, 900, 'http://localhost:3000/thali-lab');

  // 2. DARK MODE
  await capture('home_1440_dark', 1440, 900, 'http://localhost:3000/?theme=dark');
  await capture('home_1024_dark', 1024, 768, 'http://localhost:3000/?theme=dark');
  await capture('home_375_dark', 375, 812, 'http://localhost:3000/?theme=dark');
  await capture('thalilab_1440_dark', 1440, 900, 'http://localhost:3000/thali-lab?theme=dark');

  console.log('All screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error running captures:', err);
  process.exit(1);
});
