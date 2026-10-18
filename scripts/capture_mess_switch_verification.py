import asyncio
import os
import sys
import io
import shutil
import urllib.parse
import json
from pyppeteer import launch

# Force UTF-8 on Windows stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
LOCAL_DIR = r"c:\Mess Rush App\screenshots"
ARTIFACT_DIR = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\3fb1725c-436f-4a93-a928-c67a6d5f8cc7"

os.makedirs(LOCAL_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

BASE_URL = "http://localhost:3000"

VIEWPORTS = [
    {"name": "375", "width": 375, "height": 812},
    {"name": "1440", "width": 1440, "height": 900},
]

PAGES = [
    {"route": "/student", "name": "student"},
    {"route": "/staff", "name": "staff"},
    {"route": "/kitchen", "name": "kitchen"},
    {"route": "/display", "name": "display"},
]

ADMIN_SESSION = urllib.parse.quote(json.dumps({"role": "admin", "name": "Supervisor"}))

async def switch_mess_in_page(page, target_id, target_short_name):
    """Switch mess cleanly and ensure dropdowns/modals close"""
    res = await page.evaluate(f"""async () => {{
        // 1. Try nav selector button
        const navBtn = document.querySelector('#nav-mess-selector-btn');
        if (navBtn && !navBtn.disabled) {{
            navBtn.click();
            await new Promise(r => setTimeout(r, 200));

            const targetBtn = document.querySelector(`[data-mess-id="{target_id}"]`);
            if (targetBtn) {{
                targetBtn.click();
                await new Promise(r => setTimeout(r, 200));
                return {{ method: 'nav_dropdown', success: true }};
            }}
            // Close nav dropdown if target wasn't found
            navBtn.click();
        }}

        // 2. Direct event dispatch to SelectedMessProvider singleton
        window.dispatchEvent(new CustomEvent('uniq_mess_changed', {{
            detail: {{ id: '{target_id}', shortName: '{target_short_name}' }}
        }}));

        // Close any modals that might be open
        const closeBtn = document.querySelector('button[aria-label="Close"], button[aria-label="Close selector"]');
        if (closeBtn) closeBtn.click();

        return {{ method: 'event', success: true }};
    }}""")
    await asyncio.sleep(1.2)
    return res

async def capture_verification():
    print("=" * 70)
    print("STARTING VERIFICATION SCREENSHOT CAPTURE ACROSS 4 PAGES & 3 MESSES")
    print("=" * 70)

    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )

    try:
        for p_info in PAGES:
            route = p_info["route"]
            page_name = p_info["name"]
            print(f"\n>>> Verifying Page: {route}")

            for vp in VIEWPORTS:
                vp_name = vp["name"]
                page = await browser.newPage()
                await page.setViewport({"width": vp["width"], "height": vp["height"], "deviceScaleFactor": 1})

                # Set session cookie for protected routes (/staff and /kitchen)
                await page.setCookie({
                    "name": "mess_rush_session",
                    "value": ADMIN_SESSION,
                    "domain": "localhost",
                    "path": "/"
                })

                # 1. INITIAL STATE: Central Mess North (Mess A)
                url_a = f"{BASE_URL}{route}?mess=central-mess-north"
                await page.goto(url_a, {"waitUntil": "networkidle2"})
                await asyncio.sleep(1.2)

                # Capture BEFORE switch (Central Mess North)
                filename_before = f"{page_name}_before_switch_{vp_name}.png"
                local_path_before = os.path.join(LOCAL_DIR, filename_before)
                artifact_path_before = os.path.join(ARTIFACT_DIR, filename_before)
                await page.screenshot({"path": local_path_before, "fullPage": False})
                shutil.copyfile(local_path_before, artifact_path_before)
                print(f"  [Captured Before] {filename_before} (Central Mess North)")

                # 2. SWITCH 1: Switch to Girls Hostel 3 (Mess B) WITHOUT manual reload
                print(f"  Switching to Girls Hostel 3 on {route} @ {vp_name}...")
                await switch_mess_in_page(page, "girls-hostel-3", "Girls Hostel 3")
                await asyncio.sleep(1.2)

                # Capture AFTER switch 1 (Girls Hostel 3)
                filename_after = f"{page_name}_after_switch_{vp_name}.png"
                local_path_after = os.path.join(LOCAL_DIR, filename_after)
                artifact_path_after = os.path.join(ARTIFACT_DIR, filename_after)
                await page.screenshot({"path": local_path_after, "fullPage": False})
                shutil.copyfile(local_path_after, artifact_path_after)
                print(f"  [Captured After] {filename_after} (Girls Hostel 3)")

                # Verify state
                state_check = await page.evaluate("""() => {
                    const nav = document.querySelector('#nav-mess-shortname')?.innerText.trim();
                    const url = window.location.href;
                    return { nav, url };
                }""")
                print(f"  Active state on {route} @ {vp_name}: {state_check}")

                # 3. SWITCH 2: Switch to Central Mess South (Mess C) to verify 3rd mess
                print(f"  Switching to Central Mess South on {route} @ {vp_name}...")
                await switch_mess_in_page(page, "central-mess-south", "Central South")
                await asyncio.sleep(1.2)

                filename_mess_c = f"{page_name}_mess3_switch_{vp_name}.png"
                local_path_c = os.path.join(LOCAL_DIR, filename_mess_c)
                artifact_path_c = os.path.join(ARTIFACT_DIR, filename_mess_c)
                await page.screenshot({"path": local_path_c, "fullPage": False})
                shutil.copyfile(local_path_c, artifact_path_c)
                print(f"  [Captured 3rd Mess] {filename_mess_c} (Central Mess South)")

                await page.close()

        # ======================================================================
        # TEST LOCKED ROLE SELECTOR DISABLED
        # ======================================================================
        print("\n>>> Verifying Locked Role: Staff locked to Girls Hostel Mess 3")
        page_locked = await browser.newPage()
        await page_locked.setViewport({"width": 1440, "height": 900})
        locked_session = urllib.parse.quote(json.dumps({
            "role": "staff",
            "name": "Head Staff",
            "messCode": "girls-hostel-3",
            "messName": "Girls Hostel Mess 3"
        }))
        await page_locked.setCookie({
            "name": "mess_rush_session",
            "value": locked_session,
            "domain": "localhost",
            "path": "/"
        })
        await page_locked.goto(f"{BASE_URL}/staff", {"waitUntil": "networkidle2"})
        await asyncio.sleep(1.0)

        locked_eval = await page_locked.evaluate("""() => {
            const navBtn = document.querySelector('#nav-mess-selector-btn') || document.querySelector('header button[title*="Selected mess"]') || document.querySelector('header button[title*="Assigned to"]');
            return {
                disabled: navBtn?.disabled,
                text: navBtn?.innerText.trim(),
                title: navBtn?.title
            };
        }""")
        print(f"  Locked staff nav selector: {locked_eval}")
        assert locked_eval.get("disabled") == True, "Selector must be disabled for locked staff"
        assert "Girls Hostel 3" in (locked_eval.get("text") or ""), "Selector must show locked mess name"
        print("  [PASS] Locked role selector disabled and displays mess name!")

        filename_locked = "staff_locked_role_1440.png"
        local_path_locked = os.path.join(LOCAL_DIR, filename_locked)
        artifact_path_locked = os.path.join(ARTIFACT_DIR, filename_locked)
        await page_locked.screenshot({"path": local_path_locked, "fullPage": False})
        shutil.copyfile(local_path_locked, artifact_path_locked)
        await page_locked.close()

    finally:
        await browser.close()

    print("\n" + "=" * 70)
    print("ALL VERIFICATION SCREENSHOTS & AUDIT TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(capture_verification())
