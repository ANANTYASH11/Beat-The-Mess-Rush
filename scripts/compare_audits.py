import json
from collections import defaultdict

with open(r"c:\Mess Rush App\screenshots\mobile_audit_baseline_results.json", "r", encoding="utf-8") as f:
    baseline = json.load(f)

with open(r"c:\Mess Rush App\screenshots\mobile_audit_after_results.json", "r", encoding="utf-8") as f:
    after = json.load(f)

# Look at entries
def analyze_set(dataset, label):
    pages = set()
    widths = set()
    devices = set()
    by_page = defaultdict(lambda: {"overflow_docs": 0, "max_overflow": 0, "small_taps": [], "small_texts": [], "hydration": 0, "errors": 0, "cls": []})
    for entry in dataset:
        page = entry.get("page") or entry.get("page_name")
        pages.add(page)
        w = entry.get("width")
        d = entry.get("device")
        if w: widths.add(w)
        if d: devices.add(d)

        # Doc overflow
        winW = entry.get("winWidth", 0)
        docScrollW = entry.get("docScrollWidth", 0)
        overflow_px = max(0, docScrollW - winW)
        if overflow_px > 0:
            by_page[page]["overflow_docs"] += 1
            if overflow_px > by_page[page]["max_overflow"]:
                by_page[page]["max_overflow"] = overflow_px

        by_page[page]["small_taps"].append(entry.get("smallTapTargetCount", 0))
        by_page[page]["small_texts"].append(entry.get("smallTextCount", 0))
        by_page[page]["hydration"] += len(entry.get("hydrationWarnings", []))
        by_page[page]["errors"] += len(entry.get("consoleErrors", []))
        by_page[page]["cls"].append(entry.get("cls", 0))

    print(f"\n=== {label} SUMMARY ===")
    print(f"Pages: {sorted(list(pages))}")
    print(f"Widths: {sorted(list(widths))}")
    print(f"Devices: {sorted(list(devices))}")
    for p, stats in sorted(by_page.items()):
        avg_tap = sum(stats["small_taps"]) / max(1, len(stats["small_taps"]))
        avg_text = sum(stats["small_texts"]) / max(1, len(stats["small_texts"]))
        max_cls = max(stats["cls"]) if stats["cls"] else 0
        print(f"  {p}: OverflowDocs={stats['overflow_docs']} (Max={stats['max_overflow']}px) | Avg Tap<48={avg_tap:.1f} | Avg Text<14={avg_text:.1f} | Hydration={stats['hydration']} | Errors={stats['errors']} | Max CLS={max_cls}")

analyze_set(baseline, "BASELINE")
analyze_set(after, "AFTER FIXES")
