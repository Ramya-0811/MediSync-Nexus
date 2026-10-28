
import json
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge_base"
REGISTRY_FILE = KNOWLEDGE_DIR / "source_registry.json"
DOCUMENTS_DIR = KNOWLEDGE_DIR / "documents"


def validate_sources():
    if not REGISTRY_FILE.exists():
        raise FileNotFoundError(
            f"Source registry not found: {REGISTRY_FILE}"
        )

    with REGISTRY_FILE.open("r", encoding="utf-8") as file:
        sources = json.load(file)

    if not isinstance(sources, list):
        raise ValueError(
            "Source registry must contain a JSON list."
        )

    if not sources:
        print("WARNING: The source registry is empty.")

    seen_ids = set()
    errors = 0
    warnings = 0

    for index, source in enumerate(sources, start=1):
        print(f"\nSource {index}: {source.get('title', 'Untitled')}")

        required_fields = [
            "document_id",
            "title",
            "file",
            "source_type",
            "source_name",
        ]

        for field in required_fields:
            if not source.get(field):
                print(f"  ERROR: Missing {field}")
                errors += 1

        document_id = source.get("document_id")

        if document_id:
            if document_id in seen_ids:
                print(f"  ERROR: Duplicate ID: {document_id}")
                errors += 1
            seen_ids.add(document_id)

        filename = source.get("file")

        if filename:
            # Only allow a filename, not an arbitrary path.
            if Path(filename).name != filename:
                print("  ERROR: File must be a filename only.")
                errors += 1
            elif not (DOCUMENTS_DIR / filename).is_file():
                print(f"  ERROR: Document missing: {filename}")
                errors += 1

        source_type = source.get("source_type", "").lower()
        url = source.get("url")

        if "internal" not in source_type and not url:
            print("  WARNING: External source has no URL.")
            warnings += 1

        if url:
            parsed = urlparse(url)

            if parsed.scheme != "https" or not parsed.netloc:
                print("  WARNING: URL is not a valid HTTPS URL.")
                warnings += 1

        if source.get("verified") is not True:
            print("  WARNING: Source is not marked verified.")
            warnings += 1

    print("\n--- Validation Summary ---")
    print(f"Sources checked: {len(sources)}")
    print(f"Errors: {errors}")
    print(f"Warnings: {warnings}")

    if errors:
        print("Validation failed. Fix the errors above.")
        return False

    print(
        "Registry structure is valid. "
        "This does not prove source authenticity or accuracy."
    )
    return True


if __name__ == "__main__":
    try:
        valid = validate_sources()
        if not valid:
            raise SystemExit(1)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Validation error: {error}")
        raise SystemExit(1)
