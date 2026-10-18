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
ARTIFACT_DIR = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\3fb1725c-436f-4a93-a928-c67a6d5f8cc7"

os.makedirs(LOCAL_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

VIEWPORTS = [
    {"name": "375", "width": 375, "height": 812},
    {"name": "1440", "width": 1440, "height": 900},
]
THEMES = ["light", "dark"]

async def main():
    print("Launching browser to capture UX simplification screenshots...")
    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    try:
        # ── 1. CAPTURE /STUDENT STEPS 1, 2, 3 ──
        for vp in VIEWPORTS:
            for theme in THEMES:
                page = await browser.newPage()
                await page.setViewport({"width": vp["width"], "height": vp["height"], "deviceScaleFactor": 1})

                # Go to student page
                await page.goto("http://localhost:3000/student?mess=central-mess-north", {"waitUntil": "networkidle2"})
                await asyncio.sleep(0.5)

                # Set theme
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

                # ── STEP 1: WHEN ──
                await page.evaluate("""() => {
                    const step1Tab = document.querySelector('#step-tab-1');
                    if (step1Tab) step1Tab.click();
                }""")
                await asyncio.sleep(0.5)

                s1_name = f"student_step1_{vp['name']}_{theme}.png"
                s1_local = os.path.join(LOCAL_DIR, s1_name)
                s1_art = os.path.join(ARTIFACT_DIR, s1_name)
                await page.screenshot({"path": s1_local, "fullPage": False})
                shutil.copy2(s1_local, s1_art)
                print(f"Captured: {s1_name}")

                # ── STEP 2: WHAT ──
                await page.evaluate("""() => {
                    const step2Tab = document.querySelector('#step-tab-2');
                    if (step2Tab) step2Tab.click();
                }""")
                await asyncio.sleep(0.5)

                s2_name = f"student_step2_{vp['name']}_{theme}.png"
                s2_local = os.path.join(LOCAL_DIR, s2_name)
                s2_art = os.path.join(ARTIFACT_DIR, s2_name)
                await page.screenshot({"path": s2_local, "fullPage": False})
                shutil.copy2(s2_local, s2_art)
                print(f"Captured: {s2_name}")

                # ── STEP 3: CONFIRM ──
                await page.evaluate("""() => {
                    const step3Tab = document.querySelector('#step-tab-3');
                    // navigate to step 3 via next button or direct state
                    const actionBtn = document.querySelector('#action-btn-primary');
                    if (actionBtn) actionBtn.click();
                }""")
                await asyncio.sleep(0.6)

                s3_name = f"student_step3_{vp['name']}_{theme}.png"
                s3_local = os.path.join(LOCAL_DIR, s3_name)
                s3_art = os.path.join(ARTIFACT_DIR, s3_name)
                await page.screenshot({"path": s3_local, "fullPage": False})
                shutil.copy2(s3_local, s3_art)
                print(f"Captured: {s3_name}")

                await page.close()

        # ── 2. CAPTURE /STAFF ──
        for vp in VIEWPORTS:
            for theme in THEMES:
                page = await browser.newPage()
                await page.setViewport({"width": vp["width"], "height": vp["height"], "deviceScaleFactor": 1})

                await page.setCookie({
                    'name': 'mess_rush_session',
                    'value': '%7B%22role%22%3A%22staff%22%2C%22name%22%3A%22Demo%20Staff%22%2C%22messCode%22%3A%22central-mess-north%22%7D',
                    'domain': 'localhost',
                    'path': '/'
                })

                await page.goto("http://localhost:3000/staff?mess=central-mess-north", {"waitUntil": "networkidle2"})
                await asyncio.sleep(0.5)

                # Set theme
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
                await asyncio.sleep(0.6)

                staff_name = f"staff_{vp['name']}_{theme}.png"
                staff_local = os.path.join(LOCAL_DIR, staff_name)
                staff_art = os.path.join(ARTIFACT_DIR, staff_name)
                await page.screenshot({"path": staff_local, "fullPage": False})
                shutil.copy2(staff_local, staff_art)
                print(f"Captured: {staff_name}")

                await page.close()

    finally:
        await browser.close()

    print("All 16 UX simplification screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(main())
