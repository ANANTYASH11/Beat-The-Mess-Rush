import json

with open(r"c:\Mess Rush App\screenshots\mobile_audit_after_results.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for entry in data:
    if entry.get("winWidth") == 320:
        p = entry.get("page")
        t = entry.get("theme")
        dev = entry.get("device")
        docW = entry.get("docScrollWidth")
        winW = entry.get("winWidth")
        overflows = entry.get("overflowingElements", [])
        if docW > winW:
            print(f"[{dev}] {p} ({t}) docW={docW} winW={winW} overflowCount={len(overflows)}")
            for o in overflows[:3]:
                print(f"   tag={o.get('tag')} id={o.get('id')} class={o.get('className')[:50]} right={o.get('right')} overflowPx={o.get('overflowPx')} text={o.get('text')[:30]}")
