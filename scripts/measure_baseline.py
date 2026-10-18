import subprocess
import json
import os
import sys

ROUTES = [
    {"name": "Home", "url": "http://localhost:3000/"},
    {"name": "Student", "url": "http://localhost:3000/student"},
    {"name": "Staff", "url": "http://localhost:3000/staff"},
    {"name": "Kitchen", "url": "http://localhost:3000/kitchen"},
    {"name": "Display", "url": "http://localhost:3000/display"},
]

OUTPUT_DIR = r"c:\Mess Rush App\screenshots\lighthouse"
os.makedirs(OUTPUT_DIR, exist_ok=True)

results = {}

for r in ROUTES:
    name = r["name"]
    url = r["url"]
    out_file = os.path.join(OUTPUT_DIR, f"{name.lower()}_baseline.json")
    print(f"Running Lighthouse on {name} ({url})...")

    # Moto G-class mobile throttling profile:
    # 360x640 DPR 2, 4x CPU slowdown, mobile user agent, devtools throttling
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
        subprocess.run(cmd, check=True)
        with open(out_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            categories = data.get("categories", {})
            audits = data.get("audits", {})

            perf_score = int((categories.get("performance", {}).get("score", 0) or 0) * 100)
            lcp = audits.get("largest-contentful-paint", {}).get("displayValue", "N/A")
            tbt = audits.get("total-blocking-time", {}).get("displayValue", "N/A")
            cls = audits.get("cumulative-layout-shift", {}).get("displayValue", "N/A")
            si = audits.get("speed-index", {}).get("displayValue", "N/A")

            results[name] = {
                "score": perf_score,
                "lcp": lcp,
                "tbt": tbt,
                "cls": cls,
                "speed_index": si
            }
            print(f"  {name}: Score {perf_score} | LCP {lcp} | TBT {tbt} | CLS {cls}")
    except Exception as e:
        print(f"  Error auditing {name}: {e}")
        results[name] = {"error": str(e)}

summary_file = os.path.join(OUTPUT_DIR, "baseline_summary.json")
with open(summary_file, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\n" + "=" * 60)
print("BASELINE LIGHTHOUSE METRICS SUMMARY")
print("=" * 60)
print(json.dumps(results, indent=2))
