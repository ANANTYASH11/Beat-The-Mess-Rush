import asyncio
import os
import sys
import io
import shutil
from pyppeteer import launch

# Force UTF-8 on Windows stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
LOCAL_DIR = r"c:\Mess Rush App\screenshots\display"
ARTIFACT_DIR = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\276b7217-5c3f-48f3-b529-74aabe386be9"

os.makedirs(LOCAL_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

VIEWPORTS = [
    {"name": "1920x1080", "width": 1920, "height": 1080},
    {"name": "1024x768", "width": 1024, "height": 768},
    {"name": "768x1024", "width": 768, "height": 1024},
]

SCENARIOS = [
    {"suffix": "during", "params": "kiosk=1&during=1"},
    {"suffix": "outside", "params": "kiosk=1&outside=1"},
    {"suffix": "offline", "params": "kiosk=1&offline=1"},
]

async def main():
    print("Launching browser to capture entrance display screenshots...")
    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    try:
        for vp in VIEWPORTS:
            for sc in SCENARIOS:
                page = await browser.newPage()
                await page.setViewport({"width": vp["width"], "height": vp["height"], "deviceScaleFactor": 1})

                url = f"http://localhost:3000/display?{sc['params']}"
                print(f"Loading {url} at {vp['name']}...")
                await page.goto(url, {"waitUntil": "networkidle2"})
                await asyncio.sleep(1.0)

                fname = f"display_{vp['name']}_{sc['suffix']}.png"
                local_path = os.path.join(LOCAL_DIR, fname)
                art_path = os.path.join(ARTIFACT_DIR, fname)
                await page.screenshot({"path": local_path, "fullPage": False})
                shutil.copy2(local_path, art_path)
                print(f"Captured: {fname}")

                await page.close()

    finally:
        await browser.close()

    print("All display screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(main())
