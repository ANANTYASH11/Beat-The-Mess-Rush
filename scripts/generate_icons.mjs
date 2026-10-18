import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const publicDir = 'c:\\Mess Rush App\\public';

const svgContent = fs.readFileSync(path.join(publicDir, 'icon.svg'), 'utf-8');

async function renderIcon(size, isMaskable = false) {
  const tempDir = path.join(process.env.TEMP, `chrome_icon_${size}_${Math.random().toString(36).substring(2, 6)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const port = 9300 + Math.floor(Math.random() * 400);
  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    `--window-size=${size},${size}`,
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 150));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch {}
  }

  if (!wsUrl) {
    proc.kill();
    return;
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

  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: size,
    height: size,
    deviceScaleFactor: 1,
    mobile: false
  });

  const html = isMaskable
    ? `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F4ECD8;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;overflow:hidden;"><div style="width:75%;height:75%;">${svgContent}</div></body></html>`
    : `<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;overflow:hidden;"><div style="width:100%;height:100%;">${svgContent}</div></body></html>`;

  await sendSession('Page.enable');
  await sendSession('Page.navigate', {
    url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
  });

  await new Promise(r => setTimeout(r, 600));

  const screenshot = await sendSession('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    ...(isMaskable ? {} : { captureBeyondViewport: false })
  });

  ws.close();
  proc.kill();
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

  return Buffer.from(screenshot.data, 'base64');
}

async function main() {
  console.log('Generating 32px icon...');
  const buf32 = await renderIcon(32);
  if (buf32) {
    fs.writeFileSync(path.join(publicDir, 'icon-32.png'), buf32);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf32);
  }

  console.log('Generating 180px apple icon...');
  const buf180 = await renderIcon(180);
  if (buf180) {
    fs.writeFileSync(path.join(publicDir, 'icon-180.png'), buf180);
    fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);
  }

  console.log('Generating 512px icon...');
  const buf512 = await renderIcon(512);
  if (buf512) {
    fs.writeFileSync(path.join(publicDir, 'icon-512.png'), buf512);
  }

  console.log('Generating 512px maskable icon...');
  const bufMaskable = await renderIcon(512, true);
  if (bufMaskable) {
    fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), bufMaskable);
  }

  console.log('Icons generated successfully!');
}

main().catch(console.error);
