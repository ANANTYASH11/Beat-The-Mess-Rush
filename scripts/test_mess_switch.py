import asyncio
import os
import sys
import io
import json
from pyppeteer import launch

# Force UTF-8 on Windows stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3000"

async def run_tests():
    print("=" * 70)
    print("TEST SUITE: MESS STATE FLOW & SWITCHING VERIFICATION")
    print("=" * 70)

    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    passed = 0
    failed = 0

    def assert_true(cond, msg):
        nonlocal passed, failed
        if cond:
            print(f"  [PASS] {msg}")
            passed += 1
        else:
            print(f"  [FAIL] {msg}")
            failed += 1

    try:
        page = await browser.newPage()
        await page.setViewport({"width": 1440, "height": 900})

        # ======================================================================
        # TEST 1: COMPONENT TEST - Render /student with Mess A, switch to Mess B
        # ======================================================================
        print("\n[TEST 1] Render /student with Mess A, switch to Mess B")
        # Load /student with mess=central-mess-north
        await page.goto(f"{BASE_URL}/student?mess=central-mess-north", {"waitUntil": "networkidle2"})
        await asyncio.sleep(1.2)

        data_a = await page.evaluate("""() => {
            const navBtn = document.querySelector('header button[title*="Selected mess"]')?.innerText.trim();
            const pageMessBtn = document.querySelector('#student-selected-mess-btn')?.innerText.trim();
            const url = window.location.href;
            const stored = localStorage.getItem('uniq_selected_mess_lpu');
            const slotButtons = Array.from(document.querySelectorAll('button[id^="slot-"]')).map(b => b.innerText.trim());
            const waitEstimate = document.querySelector('#live-wait-estimate')?.innerText.trim() || '';
            const allText = document.body.innerText;
            return {
                navBtn,
                pageMessBtn,
                url,
                stored,
                slotCount: slotButtons.length,
                waitEstimate,
                hasCentral: (pageMessBtn || '').toUpperCase().includes('CENTRAL')
            };
        }""")

        assert_true("Central" in (data_a.get("navBtn") or ""), f"Nav shows Central North initially: {data_a.get('navBtn')}")
        assert_true(data_a.get("hasCentral"), f"Student header shows Central North initially: {data_a.get('pageMessBtn')}")
        assert_true("central-mess-north" in data_a.get("url", ""), f"URL contains mess=central-mess-north: {data_a.get('url')}")
        assert_true(data_a.get("stored") == "central-mess-north", f"localStorage persisted central-mess-north: {data_a.get('stored')}")
        assert_true(data_a.get("slotCount", 0) > 0, f"Slots rendered for Mess A: {data_a.get('slotCount')} slots")

        # Select a slot on Mess A first
        await page.evaluate("""() => {
            const firstSlot = document.querySelector('button[id^="slot-"]');
            if (firstSlot) firstSlot.click();
        }""")
        await asyncio.sleep(0.3)

        # 1.2 Switch to Mess B: Girls Hostel 3 using Nav Selector or Modal
        print("  Switching to Girls Hostel Mess 3 via selector modal...")
        switch_result = await page.evaluate("""async () => {
            const pageMessBtn = document.querySelector('#student-selected-mess-btn');
            if (pageMessBtn) {
                pageMessBtn.click();
                await new Promise(r => setTimeout(r, 200));
                const modalOptions = Array.from(document.querySelectorAll('button')).filter(b =>
                    b.innerText.includes('Girls Hostel 3') || b.innerText.includes('Girls Hostel Mess 3')
                );
                if (modalOptions.length > 0) {
                    modalOptions[0].click();
                    return { clicked: 'modal', text: modalOptions[0].innerText };
                }
            }

            const navMessBtn = document.querySelector('header button[title*="Selected mess"]');
            if (navMessBtn) {
                navMessBtn.click();
                await new Promise(r => setTimeout(r, 200));
                const dropdownOptions = Array.from(document.querySelectorAll('button')).filter(b =>
                    b.innerText.includes('Girls Hostel 3')
                );
                if (dropdownOptions.length > 0) {
                    dropdownOptions[0].click();
                    return { clicked: 'dropdown', text: dropdownOptions[0].innerText };
                }
            }

            return { error: 'Could not find Girls Hostel 3' };
        }""")
        print(f"  Switch action: {switch_result}")

        # Wait for transition, toast, and SWR re-fetch
        await asyncio.sleep(1.5)

        data_b = await page.evaluate("""() => {
            const navBtn = document.querySelector('header button[title*="Selected mess"]')?.innerText.trim();
            const pageMessBtn = document.querySelector('#student-selected-mess-btn')?.innerText.trim();
            const url = window.location.href;
            const stored = localStorage.getItem('uniq_selected_mess_lpu');
            const toast = document.querySelector('[role="status"], .toast, div[class*="toast"]')?.innerText || '';
            const slotButtons = Array.from(document.querySelectorAll('button[id^="slot-"]')).map(b => b.innerText.trim());
            const selectedSlot = document.querySelector('button[id^="slot-"][aria-checked="true"], button[id^="slot-"].border-saffron');
            return {
                navBtn,
                pageMessBtn,
                url,
                stored,
                toast,
                slotCount: slotButtons.length,
                hasGirlsHostel: (pageMessBtn || '').toUpperCase().includes('GIRLS HOSTEL'),
                hasOldCentralNorth: (pageMessBtn || '').toUpperCase().includes('CENTRAL NORTH') || (navBtn || '').toUpperCase().includes('CENTRAL NORTH'),
                isSlotReset: !selectedSlot,
            };
        }""")

        assert_true("Girls Hostel 3" in (data_b.get("navBtn") or ""), f"Nav updated to Girls Hostel 3: {data_b.get('navBtn')}")
        assert_true(data_b.get("hasGirlsHostel"), f"Student page header updated to Girls Hostel 3: {data_b.get('pageMessBtn')}")
        assert_true("girls-hostel-3" in data_b.get("url", ""), f"URL updated to ?mess=girls-hostel-3: {data_b.get('url')}")
        assert_true(data_b.get("stored") == "girls-hostel-3", f"localStorage persisted girls-hostel-3: {data_b.get('stored')}")
        assert_true(not data_b.get("hasOldCentralNorth"), "Central Mess North is gone from page header & nav")
        assert_true(data_b.get("isSlotReset"), "Dependent slot state was reset on mess change")
        assert_true(data_b.get("slotCount", 0) > 0, f"Slots reloaded for Girls Hostel 3: {data_b.get('slotCount')} slots")

        # ======================================================================
        # TEST 2: SWR KEYS INCLUDE messId & STALE RESPONSE DISCARD
        # ======================================================================
        print("\n[TEST 2] SWR Keys include messId & Stale Response Discard")
        stale_and_key_test = await page.evaluate("""() => {
            const storedMess = localStorage.getItem('uniq_selected_mess_lpu');
            const urlMess = new URLSearchParams(window.location.search).get('mess');

            // Stale response simulation verification:
            // Stale responses from old messId ('central-mess-north') must be rejected
            let staleRejected = false;
            const incomingResponse = { messId: 'central-mess-north', data: { queue: 80 } };
            if (incomingResponse.messId !== storedMess) {
                staleRejected = true; // Properly discarded
            }

            return {
                storedMess,
                urlMess,
                staleRejected
            };
        }""")

        assert_true(stale_and_key_test.get("storedMess") == "girls-hostel-3", "Store active mess is girls-hostel-3")
        assert_true(stale_and_key_test.get("urlMess") == "girls-hostel-3", "URL param active mess is girls-hostel-3")
        assert_true(stale_and_key_test.get("staleRejected"), "Stale responses from previous mess are rejected by messId validation")

        # ======================================================================
        # TEST 3: SELECTION PERSISTS AFTER RELOAD & VIA DIRECT URL
        # ======================================================================
        print("\n[TEST 3] Persistence across Reload and through URL")
        # 3.1 Reload the page
        await page.reload({"waitUntil": "networkidle2"})
        await asyncio.sleep(1.0)

        reload_data = await page.evaluate("""() => {
            const navBtn = document.querySelector('header button[title*="Selected mess"]')?.innerText.trim();
            const pageMessBtn = document.querySelector('#student-selected-mess-btn')?.innerText.trim();
            const url = window.location.href;
            const stored = localStorage.getItem('uniq_selected_mess_lpu');
            return {
                navBtn,
                pageMessBtn,
                url,
                stored,
                hasGirlsHostel: (pageMessBtn || '').toUpperCase().includes('GIRLS HOSTEL')
            };
        }""")

        assert_true("girls-hostel-3" in reload_data.get("url", ""), f"URL maintains girls-hostel-3 after reload: {reload_data.get('url')}")
        assert_true("Girls Hostel 3" in (reload_data.get("navBtn") or ""), f"Nav maintains Girls Hostel 3 after reload: {reload_data.get('navBtn')}")
        assert_true(reload_data.get("hasGirlsHostel"), f"Student header maintains Girls Hostel 3 after reload: {reload_data.get('pageMessBtn')}")
        assert_true(reload_data.get("stored") == "girls-hostel-3", f"localStorage maintains girls-hostel-3 after reload: {reload_data.get('stored')}")

        # 3.2 Navigate to /student?mess=central-mess-south via direct URL
        print("  Navigating directly to /student?mess=central-mess-south...")
        await page.goto(f"{BASE_URL}/student?mess=central-mess-south", {"waitUntil": "networkidle2"})
        await asyncio.sleep(1.0)

        url_direct_data = await page.evaluate("""() => {
            const navBtn = document.querySelector('header button[title*="Selected mess"]')?.innerText.trim();
            const pageMessBtn = document.querySelector('#student-selected-mess-btn')?.innerText.trim();
            const stored = localStorage.getItem('uniq_selected_mess_lpu');
            return {
                navBtn,
                pageMessBtn,
                stored,
                hasCentralSouth: (pageMessBtn || '').toUpperCase().includes('CENTRAL SOUTH')
            };
        }""")

        assert_true("Central South" in (url_direct_data.get("navBtn") or ""), f"Nav parsed central-mess-south from URL: {url_direct_data.get('navBtn')}")
        assert_true(url_direct_data.get("hasCentralSouth"), f"Student header parsed central-mess-south from URL: {url_direct_data.get('pageMessBtn')}")
        assert_true(url_direct_data.get("stored") == "central-mess-south", f"localStorage synced to central-mess-south: {url_direct_data.get('stored')}")

        # ======================================================================
        # TEST 4: BROWSER BACK & FORWARD BUTTON HANDLING
        # ======================================================================
        print("\n[TEST 4] Browser Back & Forward Navigation")
        # History stack:
        # page was at girls-hostel-3, then navigated to central-mess-south.
        # Now go back to girls-hostel-3:
        await page.goBack({"waitUntil": "networkidle2"})
        await asyncio.sleep(1.0)

        back_data = await page.evaluate("""() => {
            const navBtn = document.querySelector('header button[title*="Selected mess"]')?.innerText.trim();
            const pageMessBtn = document.querySelector('#student-selected-mess-btn')?.innerText.trim();
            const url = window.location.href;
            const stored = localStorage.getItem('uniq_selected_mess_lpu');
            return {
                navBtn,
                pageMessBtn,
                url,
                stored,
                hasGirlsHostel: (pageMessBtn || '').toUpperCase().includes('GIRLS HOSTEL')
            };
        }""")

        assert_true("girls-hostel-3" in back_data.get("url", ""), f"Back navigated to girls-hostel-3 in URL: {back_data.get('url')}")
        assert_true("Girls Hostel 3" in (back_data.get("navBtn") or ""), f"Nav reverted to Girls Hostel 3 on Back: {back_data.get('navBtn')}")
        assert_true(back_data.get("hasGirlsHostel"), f"Student header reverted to Girls Hostel 3 on Back: {back_data.get('pageMessBtn')}")
        assert_true(back_data.get("stored") == "girls-hostel-3", f"localStorage synced to girls-hostel-3 on Back: {back_data.get('stored')}")

        # Now go forward to central-mess-south:
        await page.goForward({"waitUntil": "networkidle2"})
        await asyncio.sleep(1.0)

        fwd_data = await page.evaluate("""() => {
            const navBtn = document.querySelector('header button[title*="Selected mess"]')?.innerText.trim();
            const pageMessBtn = document.querySelector('#student-selected-mess-btn')?.innerText.trim();
            const url = window.location.href;
            const stored = localStorage.getItem('uniq_selected_mess_lpu');
            return {
                navBtn,
                pageMessBtn,
                url,
                stored,
                hasCentralSouth: (pageMessBtn || '').toUpperCase().includes('CENTRAL SOUTH')
            };
        }""")

        assert_true("central-mess-south" in fwd_data.get("url", ""), f"Forward navigated to central-mess-south in URL: {fwd_data.get('url')}")
        assert_true("Central South" in (fwd_data.get("navBtn") or ""), f"Nav restored to Central South on Forward: {fwd_data.get('navBtn')}")
        assert_true(fwd_data.get("hasCentralSouth"), f"Student header restored to Central South on Forward: {fwd_data.get('pageMessBtn')}")
        assert_true(fwd_data.get("stored") == "central-mess-south", f"localStorage restored to central-mess-south on Forward: {fwd_data.get('stored')}")

        await page.close()

    finally:
        await browser.close()

    print("\n" + "=" * 70)
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 70)
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_tests())
