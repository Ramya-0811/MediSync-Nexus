
import json

from retrieve_evidence import retrieve_evidence
from citation_formatter import (
    format_citation,
    format_evidence_report,
)


def main():
    query = "source citations and doctor review"

    evidence = retrieve_evidence(query, top_k=3)
    report = format_evidence_report(query, evidence)

    print("\nMediSync Nexus Citation Test")
    print(json.dumps(report, indent=2, ensure_ascii=False))

    # Test that missing identifiers do not produce fake citations.
    invalid_item = {
        "title": "Example without source identifiers",
        "text": "This is a test sentence.",
    }

    invalid_result = format_citation(invalid_item)

    assert invalid_result["citation_status"] == "unavailable"
    assert invalid_result["citation"] is None

    # Test that an empty evidence list reports no evidence.
    empty_report = format_evidence_report(
        "unmatched test query",
        [],
    )

    assert empty_report["evidence_found"] is False
    assert empty_report["cited_evidence_count"] == 0

    print("\nPASS: Missing identifiers are not cited.")
    print("PASS: Empty evidence does not create citations.")
    print("Citation tests completed.")


if __name__ == "__main__":
    main()
