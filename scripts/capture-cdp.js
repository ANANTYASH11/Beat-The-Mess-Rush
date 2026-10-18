const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = "C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\20f245a3-f14e-4412-b778-d3e21ff38eb6";

async function runCdpCapture(targetUrl, role, width, height, filename, scrollSelector = null) {
  const port = 9333;
  const tempDir = path.join(process.env.TEMP, `chrome_cdp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    `--window-size=${width},${height}`,
    'about:blank'
  ], { detached: false });

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
      if (res.ok) {
        const json = await res.json();
        wsUrl = json.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    chromeProc.kill();
    throw new Error('Failed to connect to Chrome CDP port');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Network.enable');
  await send('Page.enable');

  const sessionData = encodeURIComponent(JSON.stringify({
    role: role,
    name: `${role.toUpperCase()} User`,
    messCode: 'central-mess-north',
  }));

  await send('Network.setCookie', {
    name: 'mess_rush_session',
    value: sessionData,
    domain: 'localhost',
    path: '/',
  });

  await send('Page.navigate', { url: targetUrl });

  // Wait 4 seconds for SWR/fetch to complete
  await new Promise(r => setTimeout(r, 4000));

  if (scrollSelector) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('${scrollSelector}');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 600));
  }

  const result = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(result.data, 'base64');
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved screenshot: ${outPath} (${buffer.length} bytes)`);

  ws.close();
  chromeProc.kill();
}

async function main() {
  console.log('1. Capturing /kitchen with loaded suggestions scrolled into view (1440x900)...');
  await runCdpCapture('http://localhost:3000/kitchen', 'kitchen', 1440, 900, 'kitchen_suggestions_1440.png', '#uniq-insights-kitchen');

  console.log('2. Capturing /kitchen with suggestions mobile (375x812)...');
  await runCdpCapture('http://localhost:3000/kitchen', 'kitchen', 375, 812, 'kitchen_suggestions_375.png', '#uniq-insights-kitchen');

  console.log('3. Capturing /admin/ml chart and retraining console (1440x900)...');
  await runCdpCapture('http://localhost:3000/admin/ml', 'admin', 1440, 900, 'admin_ml_chart_1440.png', '.recharts-responsive-container');

  console.log('All detailed screenshots captured!');
}

main().catch(e => {
  console.error('CDP capture error:', e);
  process.exit(1);
});
