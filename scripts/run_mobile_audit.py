import os
import sys
import json
import time
import io
from playwright.sync_api import sync_playwright

# Force UTF-8 stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3000"
OUTPUT_DIR = r"c:\Mess Rush App\screenshots\mobile_audit_baseline"
os.makedirs(OUTPUT_DIR, exist_ok=True)

PAGES = [
    {"route": "/", "name": "home"},
    {"route": "/student", "name": "student"},
    {"route": "/staff", "name": "staff"},
    {"route": "/kitchen", "name": "kitchen"},
    {"route": "/impact", "name": "impact"},
    {"route": "/display", "name": "display"},
    {"route": "/case-study", "name": "case_study"},
]

WIDTHS = [320, 375, 414, 768]
THEMES = ["light", "dark"]

AUDIT_JS = """() => {
    const docEl = document.documentElement;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    
    // 1. Horizontal overflow check
    const hasDocOverflow = docEl.scrollWidth > winWidth + 1;
    const overflowingElements = [];
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
        // Skip script, style, head, meta
        if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'LINK', 'NOSCRIPT'].includes(el.tagName)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            const style = window.getComputedStyle(el);
            // Ignore decorative background noise overlay if pointer-events none
            if (style.pointerEvents === 'none' && style.position === 'fixed') continue;
            // Also ignore elements hidden by overflow
            if (rect.right > winWidth + 2) {
                overflowingElements.push({
                    tag: el.tagName.toLowerCase(),
                    id: el.id || '',
                    className: (el.className || '').toString().slice(0, 80),
                    right: Math.round(rect.right),
                    winWidth: winWidth,
                    overflowPx: Math.round(rect.right - winWidth),
                    text: el.innerText ? el.innerText.trim().slice(0, 40) : ''
                });
            }
        }
    }

    // 2. Tap targets under 48px
    const smallTapTargets = [];
    const interactives = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="tab"]');
    for (const el of interactives) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
        if (rect.width === 0 || rect.height === 0) continue;
        // Check if inside sr-only container
        if (el.closest('.sr-only')) continue;

        if (rect.width < 48 || rect.height < 48) {
            smallTapTargets.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                className: (el.className || '').toString().slice(0, 60),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                text: el.innerText ? el.innerText.trim().slice(0, 30) : (el.getAttribute('aria-label') || el.value || '')
            });
        }
    }

    // 3. Text under 14px
    const smallTextElements = [];
    for (const el of allElements) {
        if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'LINK', 'NOSCRIPT'].includes(el.tagName)) continue;
        if (el.closest('.sr-only')) continue;
        // Direct leaf text or direct container
        if (el.children.length === 0 && el.innerText && el.innerText.trim().length > 0) {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            const fSize = parseFloat(style.fontSize);
            if (fSize < 14) {
                smallTextElements.push({
                    tag: el.tagName.toLowerCase(),
                    fontSize: fSize,
                    text: el.innerText.trim().slice(0, 40),
                    className: (el.className || '').toString().slice(0, 50)
                });
            }
        }
    }

    // 4. Clipped / unexpected overflow text
    const clippedElements = [];
    for (const el of allElements) {
        if (['SCRIPT', 'STYLE'].includes(el.tagName)) continue;
        if (el.children.length === 0 && el.innerText && el.innerText.trim().length > 0) {
            const style = window.getComputedStyle(el);
            if (style.textOverflow === 'ellipsis') continue;
            if (el.scrollWidth > el.clientWidth + 2 && (style.overflow === 'hidden' || style.overflowX === 'hidden')) {
                clippedElements.push({
                    tag: el.tagName.toLowerCase(),
                    text: el.innerText.trim().slice(0, 40),
                    scrollWidth: el.scrollWidth,
                    clientWidth: el.clientWidth
                });
            }
        }
    }

    // 5. Sticky / Fixed bars safe area check
    const stickyBars = [];
    for (const el of allElements) {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky') {
            const rect = el.getBoundingClientRect();
            if (rect.height > 20 && rect.width > winWidth * 0.7) {
                const isBottom = rect.bottom >= winHeight - 5;
                const isTop = rect.top <= 5;
                if (isBottom || isTop) {
                    stickyBars.push({
                        tag: el.tagName.toLowerCase(),
                        id: el.id || '',
                        className: (el.className || '').toString().slice(0, 60),
                        isTop,
                        isBottom,
                        height: Math.round(rect.height),
                        paddingBottom: style.paddingBottom,
                        hasSafeArea: style.paddingBottom.includes('env(safe-area-inset-bottom)') || 
                                     style.padding.includes('env(safe-area-inset-bottom)') ||
                                     style.paddingBottom.includes('safe-area')
                    });
                }
            }
        }
    }

    // 6. Cumulative Layout Shift from PerformanceObserver if available
    let clsValue = 0;
    try {
        const entries = performance.getEntriesByType('layout-shift');
        for (const entry of entries) {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
            }
        }
    } catch(e) {}

    return {
        docScrollWidth: docEl.scrollWidth,
        winWidth: winWidth,
        hasDocOverflow: hasDocOverflow,
        overflowCount: overflowingElements.length,
        overflowingElements: overflowingElements.slice(0, 15),
        smallTapTargetCount: smallTapTargets.length,
        smallTapTargets: smallTapTargets.slice(0, 20),
        smallTextCount: smallTextElements.length,
        smallTextElements: smallTextElements.slice(0, 20),
        clippedTextCount: clippedElements.length,
        clippedElements: clippedElements.slice(0, 15),
        stickyBars: stickyBars,
        cls: Math.round(clsValue * 1000) / 1000
    };
}"""

def run_audit():
    print("=" * 80)
    print("STARTING COMPREHENSIVE MOBILE AUDIT (BASELINE)")
    print("=" * 80)

    results = []

    with sync_playwright() as p:
        # Profile 1: Pixel 5 (Chromium)
        # Profile 2: Moto G4 (Chromium)
        # Profile 3: iPhone SE (Chromium & WebKit)
        # Device profiles from playwright
        pixel5_device = p.devices['Pixel 5']
        motog4_device = p.devices['Moto G4']
        iphone_se_device = p.devices['iPhone SE']

        device_configs = [
            {"name": "Pixel 5", "profile": pixel5_device, "engine": "chromium"},
            {"name": "Moto G4", "profile": motog4_device, "engine": "chromium"},
            {"name": "iPhone SE (Chrome)", "profile": iphone_se_device, "engine": "chromium"},
            {"name": "iPhone SE (WebKit)", "profile": iphone_se_device, "engine": "webkit"},
        ]

        # Launch browsers
        cr_browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--no-sandbox", "--disable-gpu"]
        )
        wk_browser = p.webkit.launch(headless=True)

        # 1. TEST PRESET DEVICE PROFILES
        print("\n--- 1. TESTING PRESET PROFILES (Pixel 5, Moto G4, iPhone SE, WebKit) ---")
        for dev in device_configs:
            browser = cr_browser if dev["engine"] == "chromium" else wk_browser
            dev_name = dev["name"]
            profile = dev["profile"]
            print(f"\n[DEVICE: {dev_name}] (Viewport: {profile['viewport']['width']}x{profile['viewport']['height']})")

            for theme in THEMES:
                for page_info in PAGES:
                    route = page_info["route"]
                    page_name = page_info["name"]
                    url = f"{BASE_URL}{route}?theme={theme}"

                    context = browser.new_context(
                        **profile,
                        color_scheme=theme
                    )
                    page = context.new_page()

                    console_errors = []
                    hydration_warnings = []
                    page.on("console", lambda msg: (
                        console_errors.append(msg.text) if msg.type in ["error"] else None,
                        hydration_warnings.append(msg.text) if "hydration" in msg.text.lower() or "did not match" in msg.text.lower() else None
                    ))
                    page.on("pageerror", lambda err: console_errors.append(str(err)))

                    try:
                        page.goto(url, wait_until="networkidle", timeout=15000)
                        page.wait_for_timeout(1000)

                        # Run audit JS
                        data = page.evaluate(AUDIT_JS)
                        data["device"] = dev_name
                        data["page"] = route
                        data["page_name"] = page_name
                        data["theme"] = theme
                        data["url"] = url
                        data["consoleErrors"] = console_errors
                        data["hydrationWarnings"] = hydration_warnings

                        # Screenshot
                        clean_dev = dev_name.lower().replace(" ", "_").replace("(", "").replace(")", "")
                        shot_path = os.path.join(OUTPUT_DIR, f"{clean_dev}_{page_name}_{theme}.png")
                        page.screenshot(path=shot_path, full_page=True)
                        data["screenshot"] = shot_path

                        results.append(data)
                        print(f"  {route} ({theme}): Overflow: {data['hasDocOverflow']} (scrollW: {data['docScrollWidth']} vs {data['winWidth']}), Tap <48: {data['smallTapTargetCount']}, Text <14: {data['smallTextCount']}, Errors: {len(console_errors)}, Hydration: {len(hydration_warnings)}")
                    except Exception as e:
                        print(f"  FAILED {route} on {dev_name}: {e}")
                    finally:
                        context.close()

        # 2. TEST SPECIFIC WIDTHS: 320, 375, 414, 768
        print("\n--- 2. TESTING EXACT WIDTHS: 320, 375, 414, 768 in Light & Dark ---")
        for width in WIDTHS:
            height = 800
            print(f"\n[WIDTH: {width}px]")
            for theme in THEMES:
                for page_info in PAGES:
                    route = page_info["route"]
                    page_name = page_info["name"]
                    url = f"{BASE_URL}{route}?theme={theme}"

                    context = cr_browser.new_context(
                        viewport={"width": width, "height": height},
                        is_mobile=True,
                        has_touch=True,
                        color_scheme=theme
                    )
                    page = context.new_page()

                    console_errors = []
                    hydration_warnings = []
                    page.on("console", lambda msg: (
                        console_errors.append(msg.text) if msg.type in ["error"] else None,
                        hydration_warnings.append(msg.text) if "hydration" in msg.text.lower() or "did not match" in msg.text.lower() else None
                    ))
                    page.on("pageerror", lambda err: console_errors.append(str(err)))

                    try:
                        page.goto(url, wait_until="networkidle", timeout=15000)
                        page.wait_for_timeout(800)

                        data = page.evaluate(AUDIT_JS)
                        data["device"] = f"viewport_{width}"
                        data["page"] = route
                        data["page_name"] = page_name
                        data["width"] = width
                        data["theme"] = theme
                        data["url"] = url
                        data["consoleErrors"] = console_errors
                        data["hydrationWarnings"] = hydration_warnings

                        shot_path = os.path.join(OUTPUT_DIR, f"w{width}_{page_name}_{theme}.png")
                        page.screenshot(path=shot_path, full_page=True)
                        data["screenshot"] = shot_path

                        results.append(data)
                        if data['hasDocOverflow'] or data['smallTapTargetCount'] > 0 or len(console_errors) > 0:
                            print(f"  w{width} {route} ({theme}): Overflow={data['hasDocOverflow']} (scrollW={data['docScrollWidth']}), Tap<48={data['smallTapTargetCount']}, Text<14={data['smallTextCount']}, Errors={len(console_errors)}")
                    except Exception as e:
                        print(f"  FAILED w{width} {route}: {e}")
                    finally:
                        context.close()

        cr_browser.close()
        wk_browser.close()

    # Save detailed JSON
    result_path = r"c:\Mess Rush App\screenshots\mobile_audit_baseline_results.json"
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\n[DONE] Baseline audit saved to {result_path}")

if __name__ == "__main__":
    run_audit()
