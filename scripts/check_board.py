import asyncio
from pyppeteer import launch

async def check():
    b = await launch(
        executablePath=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        headless=True,
        args=["--no-sandbox", "--disable-gpu"]
    )
    p = await b.newPage()
    await p.goto("http://localhost:3000/staff", {"waitUntil": "networkidle2"})
    await asyncio.sleep(2.0)

    rows = await p.evaluate("""() => {
        const board = document.querySelector('[role="status"]');
        if (!board) return ['NO BOARD FOUND'];
        const rowDivs = board.querySelectorAll('.flex-nowrap');
        return Array.from(rowDivs).map(r => {
            const tiles = Array.from(r.querySelectorAll('span.font-mono, span.inline-block'));
            return tiles.map(t => t.innerText.trim() || ' ').join('');
        });
    }""")
    print("Detected Board Rows:", rows)

    # Check font-display computed family for titles
    fonts = await p.evaluate("""() => {
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');
        const deck = document.querySelector('.font-display');
        return {
            h1: h1 ? window.getComputedStyle(h1).fontFamily : null,
            h2: h2 ? window.getComputedStyle(h2).fontFamily : null,
            deck: deck ? window.getComputedStyle(deck).fontFamily : null,
        };
    }""")
    print("Computed Title Fonts:", fonts)

    # Check controls positions at 1440x900 and 375x812
    for vp in [{"w": 1440, "h": 900}, {"w": 375, "h": 812}]:
        await p.setViewport({"width": vp["w"], "height": vp["h"]})
        await asyncio.sleep(0.5)
        ctrls = await p.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button, input')).filter(el => {
                const t = el.innerText || '';
                return t.includes('WALK-IN') || t.includes('SERVED') || el.placeholder?.includes('1518');
            }).map(el => {
                const r = el.getBoundingClientRect();
                return { text: (el.innerText || el.placeholder).slice(0, 15), top: Math.round(r.top), bottom: Math.round(r.bottom) };
            });
            return btns;
        }""")
        print(f"Controls at {vp['w']}x{vp['h']}:", ctrls)

    await b.close()

if __name__ == "__main__":
    asyncio.run(check())
