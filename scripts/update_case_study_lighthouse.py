import json
import os

after_file = r"c:\Mess Rush App\screenshots\lighthouse\case_study_after.json"
summary_file = r"c:\Mess Rush App\screenshots\lighthouse\lighthouse_after_summary.json"

if os.path.exists(summary_file):
    with open(summary_file, "r", encoding="utf-8") as f:
        summary = json.load(f)
else:
    summary = {}

if os.path.exists(after_file):
    with open(after_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        categories = data.get("categories", {})
        audits = data.get("audits", {})

        perf_score = int((categories.get("performance", {}).get("score", 0) or 0) * 100)
        lcp = audits.get("largest-contentful-paint", {}).get("displayValue", "N/A")
        fcp = audits.get("first-contentful-paint", {}).get("displayValue", "N/A")
        tbt = audits.get("total-blocking-time", {}).get("displayValue", "N/A")
        cls = audits.get("cumulative-layout-shift", {}).get("displayValue", "N/A")
        si = audits.get("speed-index", {}).get("displayValue", "N/A")

        summary["/case-study"] = {
            "page": "Case Study",
            "score": perf_score,
            "fcp": fcp,
            "lcp": lcp,
            "tbt": tbt,
            "cls": cls,
            "speed_index": si
        }
        print("Updated Case Study in summary:", summary["/case-study"])

    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
else:
    print("case_study_after.json not found")
