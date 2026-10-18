import io
import sys
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3000"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
    page = browser.new_page(viewport={"width": 375, "height": 667})
    page.goto(f"{BASE_URL}/student?mess=central-mess-north")
    page.wait_for_timeout(1000)

    # 1. Tap 1-tap express OR slot
    print("Page title:", page.title())
    print("Step 1 text:", page.locator("text=When Are You Eating?").is_visible())
    
    # Check slots
    slots = page.locator('button[id^="slot-"]')
    print(f"Slots found: {slots.count()}")
    if slots.count() > 0:
        print(f"Slot 1 id: {slots.first.get_attribute('id')}, text: {repr(slots.first.inner_text())}")
        slots.first.click()
        page.wait_for_timeout(300)

    action_btn = page.locator("#action-btn-primary")
    print(f"Action btn text: {repr(action_btn.inner_text())}, enabled: {action_btn.is_enabled()}")
    action_btn.click()
    page.wait_for_timeout(500)

    print("After tap 2 - Step 2 text visible:", page.locator("text=What Are You Eating?").is_visible())
    print(f"Action btn text: {repr(action_btn.inner_text())}, enabled: {action_btn.is_enabled()}")

    action_btn.click()
    page.wait_for_timeout(500)

    print("After tap 3 - Step 3 summary visible:", page.locator("text=Booking Summary").is_visible() or page.locator("text=Confirm Your Slot").is_visible())
    print(f"Action btn text: {repr(action_btn.inner_text())}, enabled: {action_btn.is_enabled()}")

    # Now click confirm slot
    action_btn.click()
    page.wait_for_timeout(1500)

    print("After tap 4 - Token visible:", page.locator("text=Your Thali Token").is_visible() or page.locator("text=TOKEN").is_visible())
    browser.close()
