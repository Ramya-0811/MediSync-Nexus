
import json
import math
import re
import sys
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).parent
CHUNKS_FILE = BASE_DIR / "knowledge_base" / "chunks.json"

STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were",
    "and", "or", "to", "of", "in", "on", "for",
    "with", "what", "how", "does", "do", "this",
    "that", "it", "be", "by", "from", "about",
}

def tokenize(text: str) -> list[str]:
    """Convert text into searchable lowercase words."""
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())

    return [
        word for word in words
        if word not in STOP_WORDS and len(word) > 1
    ]


def load_chunks() -> list[dict[str, Any]]:
    """Load text chunks from the local knowledge base."""
    if not CHUNKS_FILE.exists():
        raise FileNotFoundError(
            f"{CHUNKS_FILE} not found. "
            "Run build_knowledge_base.py first."
        )

    with CHUNKS_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    chunks = data.get("chunks", [])

    if not isinstance(chunks, list):
        raise ValueError(
            "The chunks field must contain a JSON list."
        )

    return [
        chunk for chunk in chunks
        if isinstance(chunk, dict)
    ]


def retrieve_evidence(
    query: str,
    top_k: int = 3,
) -> list[dict[str, Any]]:
    """
    Rank relevant chunks using keyword coverage,
    inverse document frequency, and title matches.

    This is improved keyword search, not semantic RAG.
    """
    if not query or not query.strip() or top_k < 1:
        return []

    query_terms = set(tokenize(query))

    if not query_terms:
        return []

    chunks = load_chunks()

    if not chunks:
        return []

    tokenized_chunks = []
    document_frequency = {}

    # Prepare searchable words and count how many chunks
    # contain each term.
    for chunk in chunks:
        text = str(chunk.get("text", ""))
        title = str(chunk.get("title", ""))

        text_terms = tokenize(text)
        title_terms = set(tokenize(title))
        unique_terms = set(text_terms)

        tokenized_chunks.append(
            (chunk, text_terms, title_terms, unique_terms)
        )

        for term in unique_terms:
            document_frequency[term] = (
                document_frequency.get(term, 0) + 1
            )

    results = []
    total_chunks = len(chunks)

    for chunk, text_terms, title_terms, unique_terms in tokenized_chunks:
        matched_terms = query_terms.intersection(unique_terms)
        title_matches = query_terms.intersection(title_terms)

        if not matched_terms and not title_matches:
            continue

        # Rare terms contribute more than very common terms.
        keyword_score = sum(
            math.log(
                1 + (
                    total_chunks /
                    (1 + document_frequency.get(term, 0))
                )
            )
            for term in matched_terms
        )

        # Reward matching terms in the title.
        title_score = 2.0 * len(title_matches)

        # Reward query coverage, not repeated occurrences.
        coverage_score = (
            len(matched_terms) / len(query_terms)
        )

        score = (
            keyword_score
            + title_score
            + coverage_score
        )

        results.append({
            "score": round(score, 4),
            "matched_terms": sorted(
                matched_terms.union(title_matches)
            ),
            "query_coverage": round(coverage_score, 4),
            "chunk_id": chunk.get("chunk_id", "Unknown"),
            "document_id": chunk.get("document_id", "Unknown"),
            "title": chunk.get("title", "Untitled"),
            "source_name": chunk.get("source_name", "Unknown source"),
            "source_type": chunk.get("source_type", "Unspecified"),
            "version": chunk.get("version", "Unknown"),
            "verified": chunk.get("verified", False),
            "text": str(chunk.get("text", "")),
        })

    # Highest score first; stable tie-break by chunk ID.
    results.sort(
        key=lambda item: (
            -item["score"],
            item["chunk_id"],
        )
    )

    return results[:top_k]


if __name__ == "__main__":
    query = " ".join(sys.argv[1:])

    if not query:
        query = "source citations and doctor review"

    try:
        evidence = retrieve_evidence(query, top_k=3)

        print("\nMediSync Nexus - Improved Evidence Search")
        print(f"Query: {query}")
        print(f"Matching chunks: {len(evidence)}\n")

        if not evidence:
            print("No matching evidence found.")
            print("Do not invent evidence or citations.")
        else:
            print(json.dumps(
                evidence,
                indent=2,
                ensure_ascii=False,
            ))

    except (
        FileNotFoundError,
        ValueError,
        json.JSONDecodeError,
    ) as error:
        print(f"Error: {error}")
        sys.exit(1)
