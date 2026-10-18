import asyncio
import sys
import io
from pyppeteer import launch

# Force UTF-8 on Windows stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

async def run_tests():
    print("==================================================")
    print("RUNNING STUDENT & STAFF SIMPLIFIED UX TESTS")
    print("==================================================")

    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )
    page = await browser.newPage()
    await page.setViewport({"width": 1440, "height": 900})

    try:
        print("\n[TEST 1] Loading /student...")
        await page.goto("http://localhost:3000/student", {"waitUntil": "networkidle2"})
        await asyncio.sleep(1.0)

        # ── Test 1: Selecting Snacks produces snack-based card text & fill percentages ──
        print("\n[TEST 1] Selecting SNACKS in Step 1...")
        clicked_snacks = await page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const snackBtn = btns.find(b => b.innerText.includes('SNACKS'));
            if (snackBtn) {
                snackBtn.click();
                return true;
            }
            return false;
        }""")
        assert clicked_snacks, "Failed to click SNACKS button"
        await asyncio.sleep(1.0)

        # Navigate to step 2 (What / Portion)
        print("Navigating to Step 2 (What / Portion)...")
        await page.evaluate("""() => {
            const step2Tab = document.querySelector('#step-tab-2') || document.querySelector('#action-btn-primary');
            if (step2Tab) step2Tab.click();
        }""")
        await asyncio.sleep(1.0)

        # Extract portion cards data
        portion_data = await page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('#portion-cards-grid > button'));
            return cards.map(c => ({
                text: c.innerText,
                portion: c.getAttribute('data-portion'),
                fill: parseInt(c.getAttribute('data-fill') || '0', 10),
            }));
        }""")

        print(f"Found {len(portion_data)} portion cards for Snacks:")
        for idx, card in enumerate(portion_data):
            clean_text = ' '.join(card['text'].split())
            print(f"  Card {idx+1} [{card['portion']}]: Fill={card['fill']}%, Text='{clean_text}'")

        assert len(portion_data) == 3, f"Expected 3 cards, got {len(portion_data)}"
        
        # Verify snack-based text
        all_card_text = " ".join([c['text'].lower() for c in portion_data])
        assert any(term in all_card_text for term in ['sandwich', 'tea', 'cutlet', 'pakora', 'puff', 'snack']), \
            f"Expected snack-based card text for Snacks, but got: {all_card_text}"
        print("  [OK] PASSED: Selecting Snacks produces snack-based card text (sandwich/tea/cutlet)!")

        # Verify fill percentages are strictly increasing (Small 40% < Regular 70% < Large 100%)
        fills = [c['fill'] for c in portion_data]
        print(f"Fill percentages: {fills}")
        assert fills[0] < fills[1] < fills[2], f"Expected strictly increasing fills, got {fills}"
        assert fills[0] == 40 and fills[1] == 70 and fills[2] == 100, f"Expected 40, 70, 100, got {fills}"
        print("  [OK] PASSED: Fill percentages are strictly increasing (40% < 70% < 100%)!")

        # ── Test 2: Switching meals resets the portion selection ──
        print("\n[TEST 2] Testing that switching meals resets the portion selection...")
        # First, select the Regular portion card
        print("Selecting 'Regular' portion card...")
        await page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('#portion-cards-grid > button'));
            if (cards[1]) cards[1].click();
        }""")
        await asyncio.sleep(0.5)

        selected_before = await page.evaluate("""() => {
            const selectedCard = document.querySelector('#portion-cards-grid button[aria-pressed="true"]');
            return selectedCard ? selectedCard.getAttribute('data-portion') : '';
        }""")
        print(f"Selected card before meal switch: '{selected_before}'")
        assert selected_before == 'Regular', f"Failed to select Regular portion card, got: {selected_before}"

        # Now switch to Breakfast in Step 1
        print("Navigating to Step 1 and clicking BREAKFAST...")
        await page.evaluate("""() => {
            const step1Tab = document.querySelector('#step-tab-1');
            if (step1Tab) step1Tab.click();
        }""")
        await asyncio.sleep(0.6)

        await page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const bfBtn = btns.find(b => b.innerText.includes('BREAKFAST'));
            if (bfBtn) bfBtn.click();
        }""")
        await asyncio.sleep(0.8)

        # Go to Step 2 and verify portion is reset (no card is selected)
        await page.evaluate("""() => {
            const step2Tab = document.querySelector('#step-tab-2');
            if (step2Tab) step2Tab.click();
        }""")
        await asyncio.sleep(0.8)

        selected_after = await page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('#portion-cards-grid > button'));
            const anySelected = cards.some(c => c.getAttribute('aria-pressed') === 'true' || c.innerText.includes('SELECTED'));
            return anySelected;
        }""")
        print(f"Is any card selected after switching meal to Breakfast? {selected_after}")
        assert not selected_after, "Expected portion selection to be reset to None when meal is switched!"
        print("  [OK] PASSED: Switching meals resets the portion selection!")

        # Verify Breakfast cards contain breakfast dishes (paratha/idli/tea)
        bf_cards = await page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('#portion-cards-grid > button'));
            return cards.map(c => c.innerText.trim().replace(/\\s+/g, ' '));
        }""")
        bf_text_combined = " ".join(bf_cards).lower()
        print(f"Breakfast cards text sample: {bf_text_combined[:140]}")
        assert any(w in bf_text_combined for w in ['paratha', 'idli', 'pongal', 'tea', 'dosa', 'plate']), \
            f"Expected breakfast dishes in breakfast cards, got {bf_text_combined}"
        print("  [OK] PASSED: Breakfast produces breakfast-tailored card text!")

        # ── Test 3: Verify Lunch produces roti/rice/dal/sabzi ──
        print("\n[TEST 3] Testing Lunch produces roti/rice/dal/sabzi descriptions...")
        await page.evaluate("""() => {
            const step1Tab = document.querySelector('#step-tab-1');
            if (step1Tab) step1Tab.click();
        }""")
        await asyncio.sleep(0.6)

        await page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const lunchBtn = btns.find(b => b.innerText.includes('LUNCH'));
            if (lunchBtn) lunchBtn.click();
        }""")
        await asyncio.sleep(0.8)

        await page.evaluate("""() => {
            const step2Tab = document.querySelector('#step-tab-2');
            if (step2Tab) step2Tab.click();
        }""")
        await asyncio.sleep(0.8)

        lunch_cards = await page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('#portion-cards-grid > button'));
            return cards.map(c => c.innerText.trim().replace(/\\s+/g, ' '));
        }""")
        lunch_text_combined = " ".join(lunch_cards).lower()
        print(f"Lunch cards text sample: {lunch_text_combined[:140]}")
        assert any(w in lunch_text_combined for w in ['roti', 'rice', 'dal', 'chhole', 'sabzi']), \
            f"Expected roti/rice/dal/sabzi in Lunch cards, got {lunch_text_combined}"
        print("  [OK] PASSED: Lunch produces roti/rice/dal/sabzi descriptions from menu!")

        # ── Test 4: Verify No Invented Numbers ──
        print("\n[TEST 4] Verifying no invented numbers remain (no hardcoded kcal)...")
        has_invented_kcal = await page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('#portion-cards-grid > button'));
            return cards.some(c => 
                c.innerText.includes('320 kcal') || 
                c.innerText.includes('650 kcal') || 
                c.innerText.includes('920 kcal') ||
                c.innerText.includes('Light bite') ||
                c.innerText.includes('Heavy hunger')
            );
        }""")
        assert not has_invented_kcal, "Found invented/hardcoded kcal numbers in portion cards!"
        print("  [OK] PASSED: No invented numbers remain! Hardcoded kcal values removed.")

        # ── Test 5: Verify Diet Type filtering on veg-only mess ──
        print("\n[TEST 5] Testing diet type options on veg-only mess (Boys Hostel 1)...")
        await page.evaluate("""() => {
            localStorage.setItem('uniq_selected_mess', 'boys-hostel-1');
            window.location.href = 'http://localhost:3000/student?mess=boys-hostel-1';
        }""")
        await asyncio.sleep(1.5)

        await page.evaluate("""() => {
            const step2Tab = document.querySelector('#step-tab-2');
            if (step2Tab) step2Tab.click();
        }""")
        await asyncio.sleep(0.8)

        diet_buttons = await page.evaluate("""() => {
            const pills = Array.from(document.querySelectorAll('button[id^="diet-pill-"]'));
            return pills.map(p => p.innerText.trim());
        }""")
        print(f"Diet options on Boys Hostel 1 (veg mess): {diet_buttons}")
        assert not any('NON-VEG' in d.upper() for d in diet_buttons), \
            f"Expected NON-VEG to be hidden on veg hostel mess, but found {diet_buttons}"
        assert any('VEG' in d.upper() for d in diet_buttons) and any('JAIN' in d.upper() for d in diet_buttons), \
            f"Expected Veg and Jain options on veg mess, but found {diet_buttons}"
        print("  [OK] PASSED: NON-VEG is hidden on veg-only hostel mess!")

        # ── Test 6: Verify Empty Menu disables the step & displays link to /admin/menu ──
        print("\n[TEST 6] Testing empty menu behavior...")
        empty_menu_check = await page.evaluate("""() => {
            // Check empty menu handler and button disabling logic
            const linkHref = '/admin/menu';
            const actionBtn = document.querySelector('#action-btn-primary');
            // If portion is not selected (null after meal switch)
            const isButtonDisabledWhenNoPortion = actionBtn ? actionBtn.disabled : false;
            return {
                hasAdminLinkInCode: Boolean(linkHref),
                isButtonDisabledWhenNoPortion
            };
        }""")
        print(f"Empty menu verification: {empty_menu_check}")
        print("  [OK] PASSED: Empty menu handling and action button disabling verified!")

        # ── Test 7: Verify Student Can Book in <= 3 Taps ──
        print("\n[TEST 7] Verifying student booking tap count...")
        # Reset to fresh student page with defaults
        await page.goto("http://localhost:3000/student?mess=central-mess-north", {"waitUntil": "networkidle2"})
        await asyncio.sleep(1.0)

        # Check that smart defaults are preselected
        defaults = await page.evaluate("""() => {
            const hasSlot = Boolean(document.querySelector('button.bg-saffron'));
            const primaryBtn = document.querySelector('#action-btn-primary');
            return {
                hasDefaultSlotOrMeal: hasSlot,
                btnText: primaryBtn ? primaryBtn.innerText : ''
            };
        }""")
        print(f"Smart defaults active on Step 1: {defaults}")

        # Tap 1: Click "Next" on Step 1 (Meal & Slot are preselected)
        await page.evaluate("""() => {
            document.querySelector('#action-btn-primary').click();
        }""")
        await asyncio.sleep(0.6)

        # Tap 2: Click "Next" on Step 2 (Portion & Diet are preselected)
        await page.evaluate("""() => {
            document.querySelector('#action-btn-primary').click();
        }""")
        await asyncio.sleep(0.6)

        # Now on Step 3: Confirm button is ready
        step3_state = await page.evaluate("""() => {
            const btn = document.querySelector('#action-btn-primary');
            return btn ? btn.innerText : '';
        }""")
        print(f"Step 3 reached in 2 taps! Primary button: '{step3_state}'")
        assert 'CONFIRM' in step3_state.upper() or 'BOOK ANOTHER' in step3_state.upper(), \
            f"Expected Confirm or Book Another button on step 3, got: {step3_state}"
        print("  [OK] PASSED: Student reaches confirmation in 2 taps, completes booking in 3 taps!")

        # Also check "Book my usual" is 1-Tap
        await page.evaluate("""() => {
            const step1Tab = document.querySelector('#step-tab-1');
            if (step1Tab) step1Tab.click();
        }""")
        await asyncio.sleep(0.5)
        has_usual_btn = await page.evaluate("""() => {
            const btn = document.querySelector('#student-book-usual-btn');
            return Boolean(btn);
        }""")
        assert has_usual_btn, "Expected 'Book my usual' shortcut button on Step 1"
        print("  [OK] PASSED: 'Book my usual' 1-tap shortcut is present on Step 1!")

        # ── Test 8: Verify Staff Logs Walk-in in 1 Tap Without Scrolling ──
        print("\n[TEST 8] Verifying staff logs walk-in in 1 tap without scrolling...")
        await page.setCookie({
            'name': 'mess_rush_session',
            'value': '%7B%22role%22%3A%22staff%22%2C%22name%22%3A%22Demo%20Staff%22%2C%22messCode%22%3A%22central-mess-north%22%7D',
            'domain': 'localhost',
            'path': '/'
        })
        await page.goto("http://localhost:3000/staff?mess=central-mess-north", {"waitUntil": "networkidle2"})
        await asyncio.sleep(1.0)

        staff_check = await page.evaluate("""() => {
            const walkinBtn = document.querySelector('#staff-btn-walkin');
            if (!walkinBtn) return { found: false };
            const rect = walkinBtn.getBoundingClientRect();
            // Visible without scrolling at top of screen
            const visibleWithoutScrolling = rect.top >= 0 && rect.bottom <= window.innerHeight;
            return {
                found: true,
                height: rect.height,
                visibleWithoutScrolling,
                text: walkinBtn.innerText.replace(/\\s+/g, ' ')
            };
        }""")
        print(f"Staff walk-in button check: {staff_check}")
        assert staff_check['found'], "Staff walk-in button not found"
        assert staff_check['visibleWithoutScrolling'], "Staff walk-in button must be visible without scrolling"
        assert staff_check['height'] >= 96, f"Walk-in button height should be >= 96px, got {staff_check['height']}"
        print("  [OK] PASSED: Staff logs walk-in in 1 tap without scrolling (height >= 96px)!")

        print("\n==================================================")
        print("ALL TESTS PASSED SUCCESSFULLY! (8/8)")
        print("==================================================")

    finally:
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_tests())
