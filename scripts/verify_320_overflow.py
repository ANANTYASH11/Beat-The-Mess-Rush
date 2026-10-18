import os
import sys
import io
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ADMIN_COOKIE = {
    'name': 'mess_rush_session',
    'value': '%7B%22role%22%3A%22admin%22%2C%22name%22%3A%22Admin%22%2C%22messCode%22%3A%22central-mess-north%22%7D',
    'domain': 'localhost',
    'path': '/'
}

PAGES = [
    {"route": "/", "name": "home"},
    {"route": "/student", "name": "student"},
    {"route": "/staff", "name": "staff"},
    {"route": "/kitchen", "name": "kitchen"},
    {"route": "/impact", "name": "impact"},
    {"route": "/display", "name": "display"},
    {"route": "/case-study", "name": "case_study"},
]

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
    context = browser.new_context(viewport={"width": 320, "height": 640})
    context.add_cookies([ADMIN_COOKIE])
    page = context.new_page()

    print("VERIFYING 320px HORIZONTAL OVERFLOW ACROSS ALL 7 PAGES IN LIGHT & DARK:")
    for item in PAGES:
        for theme in ["light", "dark"]:
            url = f"http://localhost:3000{item['route']}?theme={theme}"
            page.goto(url, wait_until="networkidle", timeout=15000)
            page.wait_for_timeout(300)
            scroll_w, win_w = page.evaluate("() => [document.documentElement.scrollWidth, window.innerWidth]")
            overflow_px = max(0, scroll_w - win_w)
            print(f"  {item['route']} ({theme}): scrollWidth={scroll_w}, winWidth={win_w}, overflow={overflow_px}px -> {'PASS' if overflow_px == 0 else 'FAIL'}")

    browser.close()
