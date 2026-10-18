import json

with open(r"c:\Mess Rush App\screenshots\mobile_audit_after_results.json", "r", encoding="utf-8") as f:
    data = json.load(f)

seen_by_page = {}
for entry in data:
    p = entry.get("page")
    if p not in seen_by_page:
        seen_by_page[p] = []
        for t in entry.get("smallTapTargets", []):
            seen_by_page[p].append({
                "tag": t.get("tag"),
                "text": t.get("text"),
                "width": t.get("width"),
                "height": t.get("height"),
                "class": t.get("className")[:50]
            })

for p, targets in seen_by_page.items():
    print(f"\n--- Page: {p} ({len(targets)} targets < 48px) ---")
    for t in targets[:15]:
        print(f"  {t['tag']} ({t['width']}x{t['height']}): text='{t['text']}' class='{t['class']}'")
