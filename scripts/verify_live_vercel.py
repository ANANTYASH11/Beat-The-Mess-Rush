import os
import sys
import io
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"c:\Mess Rush App\screenshots\vercel_live"
os.makedirs(OUTPUT_DIR, exist_ok=True)

ADMIN_COOKIE = {
    'name': 'mess_rush_session',
    'value': '%7B%22role%22%3A%22admin%22%2C%22name%22%3A%22Admin%22%2C%22messCode%22%3A%22central-mess-north%22%7D',
    'domain': 'uniq-mess-rush.vercel.app',
    'path': '/'
}

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 667})
    context.add_cookies([ADMIN_COOKIE])
    page = context.new_page()

    # 1. Student Page
    print("Navigating to https://uniq-mess-rush.vercel.app/student...")
    page.goto("https://uniq-mess-rush.vercel.app/student", wait_until="networkidle", timeout=20000)
    page.wait_for_timeout(1000)
    
    # Check for error banner
    error_banner = page.locator('text=Failed to load slots from mess server')
    has_error = error_banner.count() > 0
    print(f"Student Page: 'Failed to load slots' error banner visible? {has_error}")
    
    # Check for arrival slots
    slots = page.locator('button:has-text("min")')
    slot_count = slots.count()
    print(f"Student Page: Loaded {slot_count} arrival slot buttons.")
    
    student_shot = os.path.join(OUTPUT_DIR, "live_student_page.png")
    page.screenshot(path=student_shot, full_page=True)
    print(f"Saved: {student_shot}")

    # 2. Kitchen Page
    print("\nNavigating to https://uniq-mess-rush.vercel.app/kitchen...")
    page.goto("https://uniq-mess-rush.vercel.app/kitchen", wait_until="networkidle", timeout=20000)
    page.wait_for_timeout(1500)

    # Check for dishes
    dishes = page.locator('text=kg')
    print(f"Kitchen Page: Found {dishes.count()} kg indicators / dishes.")
    
    kitchen_shot = os.path.join(OUTPUT_DIR, "live_kitchen_page.png")
    page.screenshot(path=kitchen_shot, full_page=True)
    print(f"Saved: {kitchen_shot}")

    browser.close()
    print("\nAll live Vercel checks completed successfully!")
