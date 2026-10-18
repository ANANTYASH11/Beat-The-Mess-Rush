import asyncio
import os
from pyppeteer import launch

OUTPUT_DIR = r"c:\Mess Rush App\screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

async def test_mess_sync():
    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    page = await browser.newPage()
    await page.setViewport({"width": 1440, "height": 900})

    # 1. Set localStorage to central-mess-south and navigate to /staff
    await page.goto("http://localhost:3000/staff")
    await page.evaluate("""() => {
        localStorage.setItem('uniq_selected_mess', 'central-mess-south');
        window.dispatchEvent(new CustomEvent('uniq_mess_changed', { detail: { id: 'central-mess-south', shortName: 'Central South', name: 'Central Mess South' } }));
    }""")
    await asyncio.sleep(1.0)

    # Check staff elements
    staff_data = await page.evaluate("""() => {
        const selectorText = document.querySelector('header button[title*="Selected mess"]')?.innerText.trim();
        const headerText = document.querySelector('#staff-control-console')?.innerText;
        const boardText = document.querySelector('[role="status"]')?.innerText;
        return { selectorText, headerText: headerText?.slice(0, 300), boardText };
    }""")
    print("Staff with Central South:")
    print("  Selector:", staff_data.get("selectorText"))
    board = staff_data.get("boardText") or ""
    print("  Board text snippet:", " ".join(board.split()))

    await page.screenshot({"path": os.path.join(OUTPUT_DIR, "staff_central_south_1440_light.png")})

    # Dark mode screenshot
    await page.evaluate("""() => {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    }""")
    await asyncio.sleep(0.5)
    await page.screenshot({"path": os.path.join(OUTPUT_DIR, "staff_central_south_1440_dark.png")})

    # Mobile screenshot
    await page.setViewport({"width": 375, "height": 812})
    await asyncio.sleep(0.5)
    await page.screenshot({"path": os.path.join(OUTPUT_DIR, "staff_central_south_375_dark.png")})

    # 2. Check student with Central South
    await page.setViewport({"width": 1440, "height": 900})
    await page.goto("http://localhost:3000/student")
    await asyncio.sleep(1.0)
    student_data = await page.evaluate("""() => {
        const selectorText = document.querySelector('header button[title*="Selected mess"]')?.innerText.trim();
        const headerBadge = document.querySelector('#student-column span.bg-\\\\[\\\\#14110F\\\\], #student-column span.font-mono')?.innerText.trim();
        return { selectorText, headerBadge };
    }""")
    print("Student with Central South:")
    print("  Selector:", student_data.get("selectorText"))
    print("  Header Badge:", student_data.get("headerBadge"))

    await page.screenshot({"path": os.path.join(OUTPUT_DIR, "student_central_south_1440_light.png")})

    await browser.close()
    print("Sync verification complete!")

if __name__ == "__main__":
    asyncio.run(test_mess_sync())
