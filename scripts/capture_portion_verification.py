import asyncio
import os
import sys
import io
import shutil
from pyppeteer import launch

# Force UTF-8 stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
LOCAL_SCREENSHOTS_DIR = r"c:\Mess Rush App\screenshots"
ARTIFACT_DIR = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\3fb1725c-436f-4a93-a928-c67a6d5f8cc7"

os.makedirs(LOCAL_SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"]
VIEWPORTS = [
    {"name": "375", "width": 375, "height": 812},
    {"name": "1440", "width": 1440, "height": 900},
]
THEMES = ["light", "dark"]

async def capture_all():
    print("Launching browser for portion verification screenshots...")
    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    results = []

    try:
        for meal in MEALS:
            for vp in VIEWPORTS:
                for theme in THEMES:
                    page = await browser.newPage()
                    await page.setViewport({
                        "width": vp["width"],
                        "height": vp["height"],
                        "deviceScaleFactor": 1
                    })

                    url = "http://localhost:3000/student?mess=central-mess-north"
                    await page.goto(url, {"waitUntil": "networkidle2"})
                    await asyncio.sleep(0.5)

                    # Apply theme
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

                    # Select Meal in Step 1
                    clicked_meal = await page.evaluate(f"""() => {{
                        const btns = Array.from(document.querySelectorAll('button'));
                        const targetBtn = btns.find(b => b.innerText.toUpperCase().includes('{meal.upper()}'));
                        if (targetBtn) {{
                            targetBtn.click();
                            return true;
                        }}
                        return false;
                    }}""")

                    if not clicked_meal:
                        print(f"Warning: could not click meal {meal}")

                    await asyncio.sleep(0.6)

                    # Go to Step 3 (Portion)
                    await page.evaluate("""() => {
                        const step3Tab = document.querySelector('#step-tab-3');
                        if (step3Tab) step3Tab.click();
                    }""")
                    await asyncio.sleep(0.8)

                    # Select 'Regular' portion card to trigger active fill and selection state
                    await page.evaluate("""() => {
                        const cards = Array.from(document.querySelectorAll('#portion-cards-grid > button'));
                        if (cards[1]) cards[1].click();
                    }""")
                    await asyncio.sleep(0.6)

                    # Extract details of rendered cards
                    card_info = await page.evaluate("""() => {
                        const cards = Array.from(document.querySelectorAll('#portion-cards-grid > button'));
                        const secondsPolicy = document.querySelector('p.font-serif')?.innerText || '';
                        return {
                            count: cards.length,
                            secondsPolicy,
                            cards: cards.map(c => ({
                                portion: c.getAttribute('data-portion'),
                                fill: c.getAttribute('data-fill'),
                                text: c.innerText.replace(/\\s+/g, ' ')
                            }))
                        };
                    }""")

                    # Screenshot file names
                    # Format: portion_{meal.lower()}_{vp['name']}_{theme}.png
                    filename = f"portion_{meal.lower()}_{vp['name']}_{theme}.png"
                    local_path = os.path.join(LOCAL_SCREENSHOTS_DIR, filename)
                    artifact_path = os.path.join(ARTIFACT_DIR, filename)

                    await page.screenshot({"path": local_path, "fullPage": False})
                    shutil.copy2(local_path, artifact_path)

                    print(f"Captured: {filename} ({vp['width']}x{vp['height']}, {theme}, {meal})")
                    for c in card_info.get("cards", []):
                        print(f"   [{c['portion']} - {c['fill']}%]: {c['text'][:80]}...")

                    results.append({
                        "file": filename,
                        "meal": meal,
                        "viewport": vp["name"],
                        "theme": theme,
                        "cardCount": card_info.get("count"),
                        "secondsPolicy": card_info.get("secondsPolicy"),
                        "cards": card_info.get("cards")
                    })

                    await page.close()

    finally:
        await browser.close()

    print("\n--- SUMMARY OF SCREENSHOTS ---")
    print(f"Total screenshots captured: {len(results)}/16")

if __name__ == "__main__":
    asyncio.run(capture_all())
