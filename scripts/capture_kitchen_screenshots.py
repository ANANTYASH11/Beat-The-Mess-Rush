import asyncio
import os
import sys
import io
import shutil
from pyppeteer import launch

# Force UTF-8 on Windows stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
LOCAL_DIR = r"c:\Mess Rush App\screenshots"
ARTIFACT_DIR = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\276b7217-5c3f-48f3-b529-74aabe386be9"

os.makedirs(LOCAL_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

VIEWPORTS = [
    {"name": "1440", "width": 1440, "height": 900},
    {"name": "375", "width": 375, "height": 812},
]
THEMES = ["light", "dark"]

async def main():
    print("Launching browser to capture /kitchen screenshots...")
    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    try:
        for vp in VIEWPORTS:
            for theme in THEMES:
                page = await browser.newPage()
                await page.setViewport({"width": vp["width"], "height": vp["height"], "deviceScaleFactor": 1})

                await page.setCookie({
                    'name': 'mess_rush_session',
                    'value': '%7B%22role%22%3A%22kitchen%22%2C%22name%22%3A%22Demo%20Kitchen%22%2C%22messCode%22%3A%22central-mess-north%22%7D',
                    'domain': 'localhost',
                    'path': '/'
                })

                url = f"http://localhost:3000/kitchen?theme={theme}"
                print(f"Loading {url} at {vp['name']}px...")
                await page.goto(url, {"waitUntil": "networkidle2"})
                await asyncio.sleep(1.0)

                # Explicitly toggle theme class on document element to be 100% sure
                await page.evaluate(f"""() => {{
                    if ('{theme}' === 'dark') {{
                        document.documentElement.classList.remove('light');
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                    }} else {{
                        document.documentElement.classList.remove('dark');
                        document.documentElement.classList.add('light');
                        localStorage.setItem('theme', 'light');
                    }}
                }}""")
                await asyncio.sleep(0.5)

                # Click "Adjust forecast" button to expand the modifiers panel
                await page.evaluate("""() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const adjustBtn = buttons.find(b => b.textContent && b.textContent.includes('Adjust forecast'));
                    if (adjustBtn) {
                        adjustBtn.click();
                    }
                }""")
                await asyncio.sleep(0.5)

                # Capture standard viewport screenshot
                fname = f"kitchen_{vp['name']}_{theme}.png"
                local_path = os.path.join(LOCAL_DIR, fname)
                art_path = os.path.join(ARTIFACT_DIR, fname)
                await page.screenshot({"path": local_path, "fullPage": False})
                shutil.copy2(local_path, art_path)
                print(f"Captured: {fname}")

                # Capture full page screenshot
                full_fname = f"kitchen_{vp['name']}_{theme}_full.png"
                full_local = os.path.join(LOCAL_DIR, full_fname)
                full_art = os.path.join(ARTIFACT_DIR, full_fname)
                await page.screenshot({"path": full_local, "fullPage": True})
                shutil.copy2(full_local, full_art)
                print(f"Captured full: {full_fname}")

                await page.close()

    finally:
        await browser.close()

    print("All /kitchen screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(main())
