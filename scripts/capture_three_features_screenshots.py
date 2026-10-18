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

TARGETS = [
    {
        "id": "timetable_admin",
        "url": "http://localhost:3000/u/lpu/admin/timetable",
        "role": "admin",
        "element": None, # Full page
    },
    {
        "id": "arrival_curve",
        "url": "http://localhost:3000/u/lpu/admin/timetable",
        "role": "admin",
        "element": "#arrival-curve-card",
    },
    {
        "id": "results_page",
        "url": "http://localhost:3000/u/lpu/admin/voting",
        "role": "admin",
        "element": None, # Full page
    },
    {
        "id": "leaderboard",
        "url": "http://localhost:3000/u/lpu/zero-waste",
        "role": "student",
        "element": None, # Full page
    },
    {
        "id": "vote_card",
        "url": "http://localhost:3000/student",
        "role": "student",
        "element": "#student-menu-voting-card",
    },
    {
        "id": "student_progress_ring",
        "url": "http://localhost:3000/student",
        "role": "student",
        "element": "#student-zero-waste-card",
    },
]

async def capture():
    print("Launching headless Chrome for verification screenshots...")
    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    try:
        for target in TARGETS:
            for vp in VIEWPORTS:
                for theme in THEMES:
                    page = await browser.newPage()
                    await page.setViewport({"width": vp["width"], "height": vp["height"], "deviceScaleFactor": 1})

                    role = target["role"]
                    cookie_val = '%7B%22role%22%3A%22admin%22%2C%22name%22%3A%22Campus%20Admin%22%7D' if role == 'admin' else '%7B%22role%22%3A%22student%22%2C%22rollNumber%22%3A%2212109845%22%7D'

                    await page.setCookie({
                        'name': 'mess_rush_session',
                        'value': cookie_val,
                        'domain': 'localhost',
                        'path': '/'
                    })

                    url = f"{target['url']}?theme={theme}"
                    print(f"Capturing {target['id']} at {vp['name']}px ({theme})...")
                    try:
                        await page.goto(url, {"waitUntil": "networkidle2", "timeout": 15000})
                    except Exception as e:
                        print(f"  Navigation note: {e}")

                    await asyncio.sleep(1.0)

                    # Toggle theme class
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

                    filename = f"{target['id']}_{vp['name']}_{theme}.png"
                    local_path = os.path.join(LOCAL_DIR, filename)
                    artifact_path = os.path.join(ARTIFACT_DIR, filename)

                    if target["element"]:
                        el = await page.querySelector(target["element"])
                        if el:
                            await el.screenshot({"path": local_path})
                        else:
                            await page.screenshot({"path": local_path, "fullPage": False})
                    else:
                        await page.screenshot({"path": local_path, "fullPage": False})

                    shutil.copy2(local_path, artifact_path)
                    print(f"  Saved -> {filename}")
                    await page.close()

    finally:
        await browser.close()
    print("All screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(capture())
