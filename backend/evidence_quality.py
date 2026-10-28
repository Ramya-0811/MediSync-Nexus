
from typing import Any


def assess_evidence_quality(
    evidence: dict[str, Any],
) -> dict[str, Any]:
    """
    Check evidence metadata and content completeness.

    This checks traceability and data quality only.
    It does not verify clinical accuracy.
    """
    issues = []
    warnings = []

    # Check required source identifiers.
    required_fields = [
        "chunk_id",
        "document_id",
        "title",
        "source_name",
        "text",
    ]

    for field in required_fields:
        value = evidence.get(field)

        if value is None or (
            isinstance(value, str) and not value.strip()
        ):
            issues.append(f"Missing required field: {field}")

    # Check evidence content.
    text = evidence.get("text")

    if isinstance(text, str) and not text.strip():
        issues.append("Evidence text is empty.")
    elif isinstance(text, str) and len(text.strip()) < 20:
        warnings.append(
            "Evidence text is very short; review its context."
        )

    # Check source verification status.
    if evidence.get("verified") is not True:
        warnings.append(
            "Source is not marked verified in the registry."
        )

    # Check source type.
    source_type = evidence.get("source_type")

    if not source_type:
        warnings.append("Source type is missing.")

    # A score helps with ranking, but does not prove accuracy.
    score = evidence.get("score")

    if score is None:
        warnings.append("Retrieval score is unavailable.")

    # Build a transparent status.
    if issues:
        status = "incomplete"
    elif warnings:
        status = "needs_review"
    else:
        status = "metadata_complete"

    return {
        "quality_status": status,
        "traceability_issues": issues,
        "review_warnings": warnings,
        "metadata_complete": len(issues) == 0,
        "clinical_accuracy_verified": False,
        "note": (
            "This assessment checks metadata and content "
            "completeness only. It does not establish source "
            "authenticity, medical accuracy, or clinical safety."
        ),
    }


def assess_evidence_list(
    evidence_items: list[dict[str, Any]],
) -> dict[str, Any]:
    """Assess each retrieved item and summarize the results."""
    results = []

    for item in evidence_items:
        results.append({
            "chunk_id": item.get("chunk_id", "Unknown"),
            "document_id": item.get("document_id", "Unknown"),
            "assessment": assess_evidence_quality(item),
        })

    incomplete_count = sum(
        result["assessment"]["quality_status"] == "incomplete"
        for result in results
    )

    review_count = sum(
        result["assessment"]["quality_status"] == "needs_review"
        for result in results
    )

    return {
        "items_checked": len(results),
        "incomplete_count": incomplete_count,
        "needs_review_count": review_count,
        "results": results,
        "clinical_accuracy_verified": False,
    }
