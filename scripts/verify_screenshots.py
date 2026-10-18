import asyncio
import os
import json
from pyppeteer import launch

OUTPUT_DIR = r"c:\Mess Rush App\screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

VIEWPORTS = [
    {"name": "1440", "width": 1440, "height": 900},
    {"name": "1024", "width": 1024, "height": 768},
    {"name": "375", "width": 375, "height": 812},
]

PAGES = [
    {"route": "student", "url": "http://localhost:3000/student"},
    {"route": "staff", "url": "http://localhost:3000/staff"},
]

THEMES = ["light", "dark"]

async def main():
    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    for p in PAGES:
        for vp in VIEWPORTS:
            for theme in THEMES:
                page = await browser.newPage()
                await page.setViewport({"width": vp["width"], "height": vp["height"], "deviceScaleFactor": 1})
                
                # Set staff session cookie
                await page.setCookie({
                    'name': 'mess_rush_session',
                    'value': '%7B%22role%22%3A%22staff%22%2C%22name%22%3A%22Demo%20Staff%22%2C%22messCode%22%3A%22central-mess-south%22%7D',
                    'domain': 'localhost',
                    'path': '/'
                })

                url = f"{p['url']}?mess=central-mess-south"
                await page.goto(url, {"waitUntil": "networkidle2"})

                # Ensure theme and mess selection in localStorage
                await page.evaluate(f"""() => {{
                    localStorage.setItem('uniq_selected_mess', 'central-mess-south');
                    if ('{theme}' === 'dark') {{
                        document.documentElement.classList.remove('light');
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                    }} else {{
                        document.documentElement.classList.remove('dark');
                        document.documentElement.classList.add('light');
                        localStorage.setItem('theme', 'light');
                    }}
                    // trigger sync event
                    window.dispatchEvent(new CustomEvent('uniq_mess_changed', {{ detail: 'central-mess-south' }}));
                    const portal = document.querySelector('nextjs-portal');
                    if (portal) portal.style.display = 'none';
                }}""")
                
                await asyncio.sleep(1.0)
                await page.evaluate("""() => {
                    const portal = document.querySelector('nextjs-portal');
                    if (portal) portal.style.display = 'none';
                }""")

                # Verification checks
                info = await page.evaluate("""() => {
                    const titles = Array.from(document.querySelectorAll('h1, h2, h3, .font-display')).map(el => {
                        return {
                            tag: el.tagName,
                            text: el.innerText.trim(),
                            fontFamily: window.getComputedStyle(el).fontFamily
                        };
                    });

                    // Check selector text vs displayed mess labels
                    const selectorBtn = document.querySelector('header button[title*="Selected mess"]') ||
                                        Array.from(document.querySelectorAll('header button')).find(b => b.innerText.includes('Central') || b.innerText.includes('Mess'));
                    const selectorText = selectorBtn ? selectorBtn.innerText.trim() : '';

                    // Check staff controls fold
                    const controls = Array.from(document.querySelectorAll('button, input')).filter(el => {
                        const t = el.innerText || '';
                        return t.includes('WALK-IN') || t.includes('SERVED') || el.placeholder?.includes('1518') || t.includes('CHECK-IN');
                    }).map(el => {
                        const r = el.getBoundingClientRect();
                        return { text: el.innerText?.trim() || el.placeholder, top: Math.round(r.top), bottom: Math.round(r.bottom) };
                    });

                    // Check split flap board
                    const board = document.querySelector('[role="status"]');
                    const boardRect = board ? board.getBoundingClientRect() : null;
                    const boardText = board ? board.innerText.replace(/\\n+/g, ' ').trim() : '';

                    // Main container padding check
                    const main = document.querySelector('main');
                    const mainPaddingLeft = main ? window.getComputedStyle(main).paddingLeft : '';
                    const mainPaddingRight = main ? window.getComputedStyle(main).paddingRight : '';

                    return {
                        selectorText,
                        boardText,
                        titles: titles.slice(0, 6),
                        controls,
                        boardRect: boardRect ? { width: Math.round(boardRect.width), height: Math.round(boardRect.height), top: Math.round(boardRect.top) } : null,
                        mainPadding: { left: mainPaddingLeft, right: mainPaddingRight }
                    };
                }""")

                filename = f"{p['route']}_{vp['name']}_{theme}.png"
                filepath = os.path.join(OUTPUT_DIR, filename)
                await page.screenshot({"path": filepath, "fullPage": False})

                # Also save full page screenshot for detailed layout inspection
                full_filename = f"{p['route']}_{vp['name']}_{theme}_full.png"
                full_filepath = os.path.join(OUTPUT_DIR, full_filename)
                await page.screenshot({"path": full_filepath, "fullPage": True})

                print(f"Captured {filename} (viewport {vp['width']}x{vp['height']})")
                print(f"  Selector: '{info.get('selectorText', '').encode('ascii', 'replace').decode()}'")
                print(f"  Board text: '{info.get('boardText', '').encode('ascii', 'replace').decode()}'")
                print(f"  Main padding: {info.get('mainPadding')}")
                if info.get('controls'):
                    safe_controls = [(c['text'].encode('ascii', 'replace').decode(), c['bottom']) for c in info['controls']]
                    print(f"  Controls: {safe_controls}")
                print(f"  Sample titles font: {[t['text'].encode('ascii', 'replace').decode() + ': ' + t['fontFamily'] for t in info.get('titles', [])[:3]]}")
                
                await page.close()

    await browser.close()
    print("All screenshots captured and verified!")

if __name__ == "__main__":
    asyncio.run(main())
