
import json
from pathlib import Path
from datetime import datetime, timezone

DATA_FILE = Path(__file__).parent / "knowledge_base" / "arbitration_records.json"


def save_record(record):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    records = []

    if DATA_FILE.exists():
        try:
            records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            records = []

    record["record_id"] = f"ARB-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
    record["created_at"] = datetime.now(timezone.utc).isoformat()
    record["status"] = "pending_clinician_review"

    records.append(record)
    DATA_FILE.write_text(
        json.dumps(records, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    return record


def get_records():
    if not DATA_FILE.exists():
        return []

    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
