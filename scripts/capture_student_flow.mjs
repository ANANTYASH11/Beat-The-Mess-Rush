import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\fe77cb46-55c3-491a-b67f-2da18880f2ac';

const prisma = new PrismaClient();

async function resetBooking() {
  const student = await prisma.student.findUnique({ where: { rollNumber: '22CS014' } });
  if (student) {
    const today = new Date().toISOString().split('T')[0];
    await prisma.slotBooking.deleteMany({
      where: {
        studentId: student.id,
        date: today,
      },
    });
    console.log('Reset bookings for 22CS014 on', today);
  }
}

async function createBrowser(width, height) {
  const tempDir = path.join(process.env.TEMP, `chrome_cdp_${Math.random().toString(36).substring(2, 8)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const port = 9222 + Math.floor(Math.random() * 500);
  const proc = spawn(chromePath, [
    '--headless=new',
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

  const { targetId } = await send('Target.createTarget', { url: 'http://localhost:3000/student' });
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

  // Wait for student column to exist
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 250));
    const evalRes = await sendSession('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("#student-column"))',
      returnByValue: true,
    });
    if (evalRes?.result?.value) break;
  }

  await new Promise(r => setTimeout(r, 1200));

  const captureScreen = async (name) => {
    const shot = await sendSession('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(outDir, `${name}.png`);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${name}.png (${fs.statSync(outPath).size} bytes)`);
    return outPath;
  };

  const clickEl = async (selector) => {
    await sendSession('Runtime.evaluate', {
      expression: `document.querySelector("${selector}")?.click()`,
    });
    await new Promise(r => setTimeout(r, 600));
  };

  const scrollTo = async (y) => {
    await sendSession('Runtime.evaluate', {
      expression: `window.scrollTo({ top: ${y}, behavior: 'instant' })`,
    });
    await new Promise(r => setTimeout(r, 300));
  };

  const close = () => {
    ws.close();
    proc.kill();
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  };

  return { captureScreen, clickEl, scrollTo, close, sendSession };
}

async function run() {
  await resetBooking();

  console.log('\n--- Capturing Desktop flow (1440x900) ---');
  const desktop = await createBrowser(1440, 900);

  // Step 1: Meal & Chalkboard
  console.log('Capturing Desktop Step 1 (Meal)...');
  await desktop.captureScreen('student_1440_step1');

  // Step 2: Time (Railway timetable)
  console.log('Capturing Desktop Step 2 (Time)...');
  await desktop.clickEl('#step-tab-2');
  await desktop.captureScreen('student_1440_step2');

  // Step 3: Portion (Matte black bowls with brass rims)
  console.log('Capturing Desktop Step 3 (Portion)...');
  await desktop.clickEl('#step-tab-3');
  await desktop.captureScreen('student_1440_step3');

  // Step 4: Confirm (Mess Token Ticket & Confetti)
  console.log('Capturing Desktop Step 4 (Confirm ticket)...');
  await desktop.clickEl('#step-tab-4');
  await new Promise(r => setTimeout(r, 500));
  await desktop.clickEl('#action-btn-primary');
  // Wait for stamp slam, screen shake and confetti
  await new Promise(r => setTimeout(r, 1600));
  await desktop.scrollTo(60);
  await desktop.captureScreen('student_1440_step4_confirmed');

  desktop.close();

  // Reset booking again before mobile capture
  await resetBooking();

  console.log('\n--- Capturing Mobile flow (375x812) ---');
  const mobile = await createBrowser(375, 812);

  // Mobile Step 1: Meal & Chalkboard with sticky bottom button
  console.log('Capturing Mobile Step 1 (Meal)...');
  await mobile.captureScreen('student_375_step1');

  // Mobile Step 2: Time (Railway timetable strip)
  console.log('Capturing Mobile Step 2 (Time)...');
  await mobile.clickEl('#step-tab-2');
  await mobile.captureScreen('student_375_step2');

  // Mobile Step 3: Portion
  console.log('Capturing Mobile Step 3 (Portion)...');
  await mobile.clickEl('#step-tab-3');
  await mobile.captureScreen('student_375_step3');

  // Mobile Step 4: Confirm (Pass)
  console.log('Capturing Mobile Step 4 (Confirm ticket)...');
  await mobile.clickEl('#step-tab-4');
  await new Promise(r => setTimeout(r, 500));
  await mobile.clickEl('#mobile-action-btn-primary');
  await new Promise(r => setTimeout(r, 1600));
  await mobile.scrollTo(90);
  await mobile.captureScreen('student_375_step4_confirmed');

  mobile.close();

  await prisma.$disconnect();
  console.log('\nAll flow screenshots captured successfully!');
}

run().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
