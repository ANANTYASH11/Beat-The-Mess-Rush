import fs from 'fs';
import path from 'path';

const outDir = 'c:\\Mess Rush App\\screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const vRes = await fetch('http://127.0.0.1:9222/json/version');
  const vJson = await vRes.json();
  const browserWsUrl = vJson.webSocketDebuggerUrl;
  console.log('Connecting to browser WS:', browserWsUrl);

  const targets = [
    { page: 'student', url: 'http://localhost:3000/student' },
    { page: 'staff', url: 'http://localhost:3000/staff' },
  ];

  const viewports = [
    { name: '1440', width: 1440, height: 900 },
    { name: '1024', width: 1024, height: 768 },
    { name: '375', width: 375, height: 812 },
  ];

  const themes = ['light', 'dark'];

  // Create a new target page
  const newTargetRes = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
  const target = await newTargetRes.json();
  const wsUrl = target.webSocketDebuggerUrl;
  console.log('Page target created:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((res) => (ws.onopen = res));

  let reqId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = reqId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await send('Page.enable');
  await send('DOM.enable');

  for (const t of targets) {
    for (const vp of viewports) {
      for (const th of themes) {
        console.log(`Capturing ${t.page} at ${vp.name} (${th})...`);

        // Navigate with theme param
        const urlWithTheme = `${t.url}?theme=${th}`;
        await send('Page.navigate', { url: urlWithTheme });
        await new Promise((r) => setTimeout(r, 1200));

        // Set device metrics
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width <= 500,
        });

        // Set theme class explicitly in DOM
        await send('Runtime.evaluate', {
          expression: `
            if ('${th}' === 'dark') {
              document.documentElement.classList.remove('light');
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
            } else {
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
              localStorage.setItem('theme', 'light');
            }
          `,
        });

        await new Promise((r) => setTimeout(r, 600));

        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: 0,
            y: 0,
            width: vp.width,
            height: vp.height,
            scale: 1,
          },
        });

        const buf = Buffer.from(shot.data, 'base64');
        const fileName = `${t.page}_${vp.name}_${th}.png`;
        const filePath = path.join(outDir, fileName);
        fs.writeFileSync(filePath, buf);
        console.log(`Saved: ${filePath} (${buf.length} bytes)`);
      }
    }
  }

  // Also close page
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  ws.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
