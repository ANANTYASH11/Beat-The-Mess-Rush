import json

with open(r"c:\Mess Rush App\screenshots\lighthouse\lighthouse_baseline_summary.json", "r", encoding="utf-8") as f:
    baseline = json.load(f)

with open(r"c:\Mess Rush App\screenshots\lighthouse\lighthouse_after_summary.json", "r", encoding="utf-8") as f:
    after = json.load(f)

print(f"{'Page':<15} | {'Base Score':<10} | {'After Score':<11} | {'Base LCP':<10} | {'After LCP':<10} | {'Base CLS':<10} | {'After CLS':<10}")
print("-" * 85)
for route in ["/", "/student", "/staff", "/kitchen", "/impact", "/display", "/case-study"]:
    b = baseline.get(route, {})
    a = after.get(route, {})
    print(f"{b.get('page', route):<15} | {b.get('score', 'N/A'):<10} | {a.get('score', 'N/A'):<11} | {b.get('lcp', 'N/A'):<10} | {a.get('lcp', 'N/A'):<10} | {b.get('cls', 'N/A'):<10} | {a.get('cls', 'N/A'):<10}")
