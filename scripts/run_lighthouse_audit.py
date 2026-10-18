import subprocess
import json
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROUTES = [
    {"name": "Home", "route": "/", "url": "http://localhost:3000/"},
    {"name": "Student", "route": "/student", "url": "http://localhost:3000/student"},
    {"name": "Staff", "route": "/staff", "url": "http://localhost:3000/staff"},
    {"name": "Kitchen", "route": "/kitchen", "url": "http://localhost:3000/kitchen"},
    {"name": "Impact", "route": "/impact", "url": "http://localhost:3000/impact"},
    {"name": "Display", "route": "/display", "url": "http://localhost:3000/display"},
    {"name": "Case Study", "route": "/case-study", "url": "http://localhost:3000/case-study"},
]

OUTPUT_DIR = r"c:\Mess Rush App\screenshots\lighthouse"
os.makedirs(OUTPUT_DIR, exist_ok=True)

results = {}

print("=" * 70)
print("RUNNING LIGHTHOUSE MOBILE AUDIT ON SLOW 4G + 4X CPU THROTTLE")
print("=" * 70)

for r in ROUTES:
    name = r["name"]
    route = r["route"]
    url = r["url"]
    slug = name.lower().replace(" ", "_")
    out_file = os.path.join(OUTPUT_DIR, f"{slug}_baseline.json")
    print(f"\n[AUDITING {name.upper()}] ({url})...")

    # Mobile Slow 4G + 4x CPU Slowdown
    cmd = [
        "npx.cmd", "lighthouse", url,
        "--output=json",
        f"--output-path={out_file}",
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--form-factor=mobile",
        "--screenEmulation.mobile=true",
        "--screenEmulation.width=360",
        "--screenEmulation.height=640",
        "--screenEmulation.deviceScaleFactor=2",
        "--throttling-method=devtools",
        "--throttling.cpuSlowdownMultiplier=4",
        "--throttling.requestLatencyMs=150",
        "--throttling.downloadThroughputKbps=1600",
        "--throttling.uploadThroughputKbps=750",
        "--only-categories=performance",
        "--quiet"
    ]

    try:
        proc = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=120)
        if os.path.exists(out_file):
            with open(out_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                categories = data.get("categories", {})
                audits = data.get("audits", {})

                perf_score = int((categories.get("performance", {}).get("score", 0) or 0) * 100)
                lcp = audits.get("largest-contentful-paint", {}).get("displayValue", "N/A")
                fcp = audits.get("first-contentful-paint", {}).get("displayValue", "N/A")
                tbt = audits.get("total-blocking-time", {}).get("displayValue", "N/A")
                cls = audits.get("cumulative-layout-shift", {}).get("displayValue", "N/A")
                si = audits.get("speed-index", {}).get("displayValue", "N/A")

                results[route] = {
                    "page": name,
                    "score": perf_score,
                    "fcp": fcp,
                    "lcp": lcp,
                    "tbt": tbt,
                    "cls": cls,
                    "speed_index": si
                }
                print(f"  --> Score: {perf_score} | FCP: {fcp} | LCP: {lcp} | TBT: {tbt} | CLS: {cls} | SI: {si}")
        else:
            print(f"  --> Failed to generate report file for {name}")
            results[route] = {"page": name, "error": "Report file not generated"}
    except Exception as e:
        print(f"  --> Error auditing {name}: {e}")
        results[route] = {"page": name, "error": str(e)}

summary_file = os.path.join(OUTPUT_DIR, "lighthouse_baseline_summary.json")
with open(summary_file, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\n" + "=" * 70)
print("BASELINE LIGHTHOUSE MOBILE SUMMARY")
print("=" * 70)
print(json.dumps(results, indent=2))
