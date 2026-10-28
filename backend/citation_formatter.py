
from typing import Any


def format_citation(evidence: dict[str, Any]) -> dict[str, Any]:
    """
    Create a traceable citation from retrieved evidence.

    This formats source metadata; it does not independently
    verify the source or establish clinical validity.
    """
    chunk_id = evidence.get("chunk_id")
    document_id = evidence.get("document_id")
    title = evidence.get("title")
    source_name = evidence.get("source_name")
    source_type = evidence.get("source_type")
    text = evidence.get("text")

    # Do not create a citation if essential identifiers are missing.
    if not chunk_id or not document_id or not title:
        return {
            "citation_status": "unavailable",
            "citation": None,
            "reason": (
                "Required source identifiers are missing. "
                "A traceable citation cannot be created."
            ),
        }

    if not isinstance(text, str) or not text.strip():
        return {
            "citation_status": "unavailable",
            "citation": None,
            "reason": "The retrieved evidence text is empty.",
        }

    citation = {
        "citation_id": f"[{document_id}, {chunk_id}]",
        "document_id": document_id,
        "chunk_id": chunk_id,
        "title": title,
        "source_name": source_name or "Unknown source",
        "source_type": source_type or "Unspecified",
        "version": evidence.get("version", "Unknown"),
        "verified": evidence.get("verified", False),
    }

    return {
        "citation_status": "available",
        "citation": citation,
        "evidence_text": text.strip(),
        "retrieval_score": evidence.get("score", 0),
        "matched_terms": evidence.get("matched_terms", []),
        "note": (
            "Citation identifies the retrieved project source. "
            "It does not prove the source is clinically validated."
        ),
    }


def format_evidence_report(
    query: str,
    evidence_items: list[dict[str, Any]],
) -> dict[str, Any]:
    """Format retrieved evidence as a traceable report."""
    cited_items = [
        format_citation(item)
        for item in evidence_items
    ]

    cited_items = [
        item for item in cited_items
        if item["citation_status"] == "available"
    ]

    return {
        "report_title": "MediSync Nexus Evidence Report",
        "query": query,
        "retrieved_count": len(evidence_items),
        "cited_evidence_count": len(cited_items),
        "evidence_found": len(cited_items) > 0,
        "results": cited_items,
        "message": (
            "Retrieved evidence includes source references."
            if cited_items
            else (
                "No traceable evidence was found. "
                "Do not invent evidence or citations."
            )
        ),
        "disclaimer": (
            "Academic Research Prototype - Simulated Data - "
            "Not for Clinical Use"
        ),
    }
