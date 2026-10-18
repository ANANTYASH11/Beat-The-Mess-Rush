import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\fe77cb46-55c3-491a-b67f-2da18880f2ac';

async function capture(name, width, height, url, scrollTo = 'top') {
  const tempDir = path.join(process.env.TEMP, `chrome_rebrand_${Math.random().toString(36).substring(2, 8)}`);
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
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    const evalRes = await sendSession('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("canvas"))',
      returnByValue: true,
    });
    if (evalRes?.result?.value) break;
  }

  // Check title and favicon
  const info = await sendSession('Runtime.evaluate', {
    expression: 'JSON.stringify({ title: document.title, favicon: document.querySelector("link[rel*=\'icon\']")?.href })',
    returnByValue: true,
  });
  console.log(`[${name}] Page Info:`, info?.result?.value);

  // If scrollTo footer, scroll down to absolute bottom
  if (scrollTo === 'footer') {
    await sendSession('Runtime.evaluate', {
      expression: 'window.scrollTo(0, document.documentElement.scrollHeight || document.body.scrollHeight);',
    });
    await new Promise(r => setTimeout(r, 1200));
  } else {
    await new Promise(r => setTimeout(r, 1800));
  }

  const shot = await sendSession('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log(`Saved: ${name}.png (${fs.statSync(outPath).size} bytes)`);

  ws.close();
  proc.kill();
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}
}

async function run() {
  console.log('--- CAPTURING NAV & HERO (TOP) ---');
  // Light Mode (1440, 1024, 375)
  await capture('rebrand_hero_1440_light', 1440, 900, 'http://localhost:3000');
  await capture('rebrand_hero_1024_light', 1024, 768, 'http://localhost:3000');
  await capture('rebrand_hero_375_light', 375, 812, 'http://localhost:3000');

  // Dark Mode (1440, 1024, 375)
  await capture('rebrand_hero_1440_dark', 1440, 900, 'http://localhost:3000/?theme=dark');
  await capture('rebrand_hero_1024_dark', 1024, 768, 'http://localhost:3000/?theme=dark');
  await capture('rebrand_hero_375_dark', 375, 812, 'http://localhost:3000/?theme=dark');

  console.log('--- CAPTURING FOOTER ---');
  // Light Mode Footer (1440, 1024, 375)
  await capture('rebrand_footer_1440_light', 1440, 900, 'http://localhost:3000', 'footer');
  await capture('rebrand_footer_1024_light', 1024, 768, 'http://localhost:3000', 'footer');
  await capture('rebrand_footer_375_light', 375, 1100, 'http://localhost:3000', 'footer');

  // Dark Mode Footer (1440, 1024, 375)
  await capture('rebrand_footer_1440_dark', 1440, 900, 'http://localhost:3000/?theme=dark', 'footer');
  await capture('rebrand_footer_1024_dark', 1024, 768, 'http://localhost:3000/?theme=dark', 'footer');
  await capture('rebrand_footer_375_dark', 375, 1100, 'http://localhost:3000/?theme=dark', 'footer');

  console.log('All verification captures completed!');
}

run().catch(err => {
  console.error('Error running captures:', err);
  process.exit(1);
});
