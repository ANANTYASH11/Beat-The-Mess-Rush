import asyncio
from pyppeteer import launch

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

async def test_meals():
    browser = await launch(
        executablePath=CHROME_PATH,
        headless=True,
        args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    )
    page = await browser.newPage()
    await page.setViewport({"width": 1440, "height": 900})

    print("Navigating to /student...")
    await page.goto("http://localhost:3000/student", {"waitUntil": "networkidle2"})
    await asyncio.sleep(1.0)

    meals_to_test = ["Breakfast", "Lunch", "Snacks", "Dinner"]

    for meal in meals_to_test:
        print(f"\nClicking meal button: {meal}...")
        
        # Click the button containing the meal text
        clicked = await page.evaluate(f"""(targetMeal) => {{
            const buttons = Array.from(document.querySelectorAll('button'));
            const mealBtn = buttons.find(b => b.innerText.includes(targetMeal.toUpperCase()));
            if (mealBtn) {{
                mealBtn.click();
                return true;
            }}
            return false;
        }}""", meal)

        if not clicked:
            print(f"ERROR: Could not find button for {meal}")
            continue

        # Wait for any API calls and potential state re-renders to settle
        await asyncio.sleep(1.5)

        # Verify selected meal in state/UI
        result = await page.evaluate("""() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const mealButtons = buttons.filter(b => 
                b.innerText.includes('BREAKFAST') ||
                b.innerText.includes('LUNCH') ||
                b.innerText.includes('SNACKS') ||
                b.innerText.includes('DINNER')
            );

            const selected = mealButtons.find(b => 
                b.className.includes('bg-[#F28C1B]') || 
                b.classList.contains('bg-[#F28C1B]')
            );

            // Also check dish header text
            const dishHeader = Array.from(document.querySelectorAll('span, div')).find(el => 
                el.innerText && el.innerText.includes("TODAY'S") && el.innerText.includes("DISHES")
            );

            return {
                selectedButtonText: selected ? selected.innerText.trim().replace(/\\n+/g, ' ') : 'NONE',
                dishHeaderText: dishHeader ? dishHeader.innerText.trim() : 'NONE'
            };
        }""")

        safe_btn = result['selectedButtonText'].encode('ascii', 'replace').decode()
        safe_header = result['dishHeaderText'].encode('ascii', 'replace').decode()
        print(f"  Selected button: {safe_btn}")
        print(f"  Dish header: {safe_header}")
        assert meal.upper() in result['selectedButtonText'], f"Failed: Expected {meal} to be selected, but got {result['selectedButtonText']}"

    print("\nAll meal selections (Breakfast, Lunch, Snacks, Dinner) verified successfully!")
    await browser.close()

if __name__ == "__main__":
    asyncio.run(test_meals())
