
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUTPUT_FILE = DATA_DIR / "patients.json"

first_names = [
    "Aarav", "Ananya", "Arjun", "Diya", "Ishaan",
    "Kavya", "Kiran", "Meera", "Nila", "Rahul",
    "Riya", "Sanjay", "Sneha", "Varun", "Yamini",
]

last_names = [
    "Sharma", "Kumar", "Ravi", "Patel", "Singh",
    "Iyer", "Reddy", "Das", "Nair", "Gupta",
]

conditions = [
    "No condition recorded",
    "Simulated hypertension",
    "Simulated diabetes",
    "Simulated asthma",
    "Simulated migraine",
]

statuses = ["Active", "Under Review", "Follow-up"]

patients = []

for i in range(100):
    patients.append({
        "id": f"MSN-{i + 1:03d}",
        "name": (
            first_names[i % len(first_names)]
            + " "
            + last_names[(i // len(first_names)) % len(last_names)]
        ),
        "age": 18 + (i * 7 % 63),
        "sex": ["Female", "Male"][i % 2],
        "condition": conditions[i % len(conditions)],
        "status": statuses[i % len(statuses)],
        "data_type": "Synthetic demo data",
    })

OUTPUT_FILE.write_text(
    json.dumps(patients, indent=2),
    encoding="utf-8",
)

print(f"Created {len(patients)} synthetic patient records.")
print(f"Saved to: {OUTPUT_FILE}")
