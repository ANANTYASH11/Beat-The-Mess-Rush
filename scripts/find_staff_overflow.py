import json

with open(r"c:\Mess Rush App\screenshots\mobile_audit_after_results.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for entry in data:
    if entry.get("page") == "/staff" and entry.get("winWidth") == 320:
        print(f"Device: {entry.get('device')} Theme: {entry.get('theme')} docScrollWidth: {entry.get('docScrollWidth')}")
        for o in entry.get("overflowingElements", []):
            if o.get("overflowPx", 0) > 35:
                print(f"  -> tag={o.get('tag')} id={o.get('id')} class={o.get('className')} overflowPx={o.get('overflowPx')} text={o.get('text')}")
