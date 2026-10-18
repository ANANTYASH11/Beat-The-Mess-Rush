import json
from collections import defaultdict

data = json.load(open(r"c:\Mess Rush App\screenshots\mobile_audit_baseline_results.json", encoding="utf-8"))

print(f"Total audit records analyzed: {len(data)}")

# Group by page
page_summary = defaultdict(lambda: {
    "overflow_runs": [],
    "max_overflow_px": 0,
    "overflowing_elements": set(),
    "small_tap_targets": defaultdict(int),
    "small_text_elements": defaultdict(int),
    "clipped_text": set(),
    "console_errors": set(),
    "hydration_warnings": set(),
    "sticky_bar_issues": set()
})

for d in data:
    page = d["page"]
    device = d.get("device", "")
    theme = d.get("theme", "")
    
    # 1. Overflow
    if d.get("hasDocOverflow"):
        overflow_px = d["docScrollWidth"] - d["winWidth"]
        page_summary[page]["overflow_runs"].append(f"{device} ({theme}): scrollW={d['docScrollWidth']} vs winW={d['winWidth']} (+{overflow_px}px)")
        if overflow_px > page_summary[page]["max_overflow_px"]:
            page_summary[page]["max_overflow_px"] = overflow_px
    
    for el in d.get("overflowingElements", []):
        page_summary[page]["overflowing_elements"].add(f"<{el['tag']} class='{el['className'][:40]}'> right={el['right']} (overflow {el['overflowPx']}px)")

    # 2. Tap targets
    for t in d.get("smallTapTargets", []):
        key = f"<{t['tag']}> '{t['text']}' ({t['width']}x{t['height']}px)"
        page_summary[page]["small_tap_targets"][key] += 1

    # 3. Small text
    for txt in d.get("smallTextElements", []):
        key = f"<{txt['tag']}> '{txt['text'][:30]}' ({txt['fontSize']}px)"
        page_summary[page]["small_text_elements"][key] += 1

    # 4. Clipped text
    for c in d.get("clippedElements", []):
        page_summary[page]["clipped_text"].add(f"<{c['tag']}> '{c['text']}' scrollW={c['scrollWidth']} > clientW={c['clientWidth']}")

    # 5. Console & Hydration
    for err in d.get("consoleErrors", []):
        page_summary[page]["console_errors"].add(err[:100])
    for w in d.get("hydrationWarnings", []):
        page_summary[page]["hydration_warnings"].add(w[:100])

    # 6. Sticky bars
    for bar in d.get("stickyBars", []):
        if bar.get("isBottom") and not bar.get("hasSafeArea"):
            page_summary[page]["sticky_bar_issues"].add(f"<{bar['tag']} id='{bar['id']}'> height={bar['height']}px lacks env(safe-area-inset-bottom)")

print("\n" + "="*80)
print("AUDIT FINDINGS BY PAGE")
print("="*80)

for page, s in page_summary.items():
    print(f"\nPAGE: {page}")
    print(f"  Max Horizontal Overflow: {s['max_overflow_px']}px across {len(s['overflow_runs'])} runs")
    if s["overflow_runs"]:
        print("    Sample runs:", s["overflow_runs"][:3])
    if s["overflowing_elements"]:
        print("    Sample overflowing elements:")
        for el in list(s["overflowing_elements"])[:3]:
            print(f"      - {el}")
    
    print(f"  Tap targets < 48px: {len(s['small_tap_targets'])} unique elements")
    sample_taps = sorted(s["small_tap_targets"].items(), key=lambda x: -x[1])[:5]
    for k, count in sample_taps:
        print(f"      - {k} (seen in {count} runs)")

    print(f"  Text < 14px: {len(s['small_text_elements'])} unique elements")
    sample_text = sorted(s["small_text_elements"].items(), key=lambda x: -x[1])[:3]
    for k, count in sample_text:
        print(f"      - {k} (seen in {count} runs)")

    if s["clipped_text"]:
        print(f"  Clipped text elements: {len(s['clipped_text'])}")
        for c in list(s["clipped_text"])[:3]:
            print(f"      - {c}")

    if s["console_errors"]:
        print(f"  Console errors: {len(s['console_errors'])}")
        for err in s["console_errors"]:
            print(f"      - {err}")

    if s["hydration_warnings"]:
        print(f"  Hydration warnings: {len(s['hydration_warnings'])}")
        for hw in s["hydration_warnings"]:
            print(f"      - {hw}")

    if s["sticky_bar_issues"]:
        print(f"  Sticky bar safe-area issues: {len(s['sticky_bar_issues'])}")
        for sb in s["sticky_bar_issues"]:
            print(f"      - {sb}")
