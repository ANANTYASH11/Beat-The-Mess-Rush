import os
import sys
import io
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
    page = browser.new_page(viewport={'width': 320, 'height': 568})
    page.goto('http://localhost:3000/student?mess=central-mess-north')
    page.wait_for_timeout(1000)

    # Click slot
    page.evaluate("() => document.querySelector('button[id^=\"slot-\"]').click()")
    page.wait_for_timeout(300)

    # Step 1 -> Step 2
    page.evaluate("() => document.querySelector('#action-btn-primary').click()")
    page.wait_for_timeout(600)

    # Check Step 2 state
    diag = page.evaluate("""() => {
        const errorAlert = document.querySelector('.bg-\\\\[#D7312B\\\\]\\\\/10');
        const errorText = document.body.innerText.includes('Menu not set yet') ? 'Menu not set yet' : (document.body.innerText.includes('Please choose your portion') ? 'Please choose portion' : 'None');
        const meal = document.querySelector('button.bg-saffron')?.innerText;
        const portionCards = document.querySelectorAll('#portion-cards-grid > div');
        const katoris = document.querySelectorAll('[data-portion]');
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
        return {
            errorText,
            meal,
            portionCardsCount: portionCards.length,
            katoriCount: katoris.length,
            buttons: buttons.slice(0, 15)
        };
    }""")
    print("Diagnostics on Step 2:", repr(diag))

    # Try clicking a portion card or katori!
    print("Clicking a portion card...")
    page.evaluate("""() => {
        const katori = document.querySelector('[data-portion="Regular"], [id*="portion"], .katori');
        if (katori) katori.click();
        const firstKatori = document.querySelectorAll('#portion-cards-grid button, #portion-cards-grid > div')[0];
        if (firstKatori) firstKatori.click();
    }""")
    page.wait_for_timeout(300)

    # Now click Next ->
    page.evaluate("() => document.querySelector('#action-btn-primary').click()")
    page.wait_for_timeout(600)
    print("Step 3 reached after clicking portion card:", page.locator("text=Booking Summary").is_visible() or page.locator("text=Confirm Your Slot").is_visible())

    browser.close()
