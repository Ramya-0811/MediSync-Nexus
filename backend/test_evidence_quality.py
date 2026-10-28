
from evidence_quality import (
    assess_evidence_quality,
    assess_evidence_list,
)


def main():
    complete_but_unverified = {
        "chunk_id": "TEST-CHUNK-001",
        "document_id": "TEST-DOC-001",
        "title": "Example Research Document",
        "source_name": "Example Publisher",
        "source_type": "Research document",
        "text": (
            "This is a sufficiently long example evidence "
            "passage for testing metadata completeness."
        ),
        "verified": False,
        "score": 2.5,
    }

    result = assess_evidence_quality(
        complete_but_unverified
    )

    assert result["quality_status"] == "needs_review"
    assert result["metadata_complete"] is True
    assert result["clinical_accuracy_verified"] is False

    print("PASS: Unverified sources require review.")

    incomplete = {
        "title": "Incomplete Example",
        "text": "Some evidence text is present.",
    }

    result = assess_evidence_quality(incomplete)

    assert result["quality_status"] == "incomplete"
    assert result["metadata_complete"] is False
    assert len(result["traceability_issues"]) > 0

    print("PASS: Missing source identifiers are flagged.")

    summary = assess_evidence_list([
        complete_but_unverified,
        incomplete,
    ])

    assert summary["items_checked"] == 2
    assert summary["incomplete_count"] == 1
    assert summary["needs_review_count"] == 1

    print("PASS: Evidence list summary is correct.")

    empty_summary = assess_evidence_list([])

    assert empty_summary["items_checked"] == 0
    assert empty_summary["clinical_accuracy_verified"] is False

    print("PASS: Empty evidence list is handled.")
    print("\nAll evidence quality tests passed.")


if __name__ == "__main__":
    main()
