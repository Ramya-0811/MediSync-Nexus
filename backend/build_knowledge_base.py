
import json
from pathlib import Path

# Project paths
BASE_DIR = Path(__file__).parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge_base"
DOCUMENTS_DIR = KNOWLEDGE_DIR / "documents"
REGISTRY_FILE = KNOWLEDGE_DIR / "source_registry.json"
OUTPUT_FILE = KNOWLEDGE_DIR / "chunks.json"

# Chunking settings
CHUNK_SIZE = 700
CHUNK_OVERLAP = 100


def load_source_registry():
    """Load document metadata from the source registry."""
    if not REGISTRY_FILE.exists():
        raise FileNotFoundError(
            f"Source registry not found: {REGISTRY_FILE}"
        )

    with REGISTRY_FILE.open("r", encoding="utf-8") as file:
        registry = json.load(file)

    if not isinstance(registry, list):
        raise ValueError(
            "source_registry.json must contain a JSON list."
        )

    return registry


def split_into_chunks(text):
    """Split text into overlapping character-based chunks."""
    text = text.strip()

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))

        # Prefer ending at a word boundary.
        if end < len(text):
            boundary = text.rfind(" ", start, end)
            if boundary > start:
                end = boundary

        chunk_text = text[start:end].strip()

        if chunk_text:
            chunks.append(chunk_text)

        if end >= len(text):
            break

        # Move forward while retaining some previous text.
        next_start = end - CHUNK_OVERLAP

        # Ensure the loop always progresses.
        start = max(next_start, start + 1)

    return chunks


def build_knowledge_base():
    """Load documents, create chunks, and save metadata."""
    registry = load_source_registry()
    all_chunks = []
    loaded_documents = 0

    for source in registry:
        filename = source.get("file")

        if not filename:
            print("Skipping a registry entry without a filename.")
            continue

        # Accept only filenames, not arbitrary filesystem paths.
        if Path(filename).name != filename:
            print(f"Skipping invalid filename: {filename}")
            continue

        document_path = DOCUMENTS_DIR / filename

        if not document_path.is_file():
            print(f"Document not found: {document_path}")
            continue

        text = document_path.read_text(encoding="utf-8").strip()

        if not text:
            print(f"Document is empty: {filename}")
            continue

        text_chunks = split_into_chunks(text)
        loaded_documents += 1

        for index, chunk_text in enumerate(text_chunks, start=1):
            all_chunks.append({
                "chunk_id": (
                    f"{source.get('document_id', filename)}"
                    f"-CHUNK-{index:03d}"
                ),
                "document_id": source.get(
                    "document_id", "UNKNOWN"
                ),
                "title": source.get("title", filename),
                "source_name": source.get(
                    "source_name", "Unknown source"
                ),
                "source_type": source.get(
                    "source_type", "Unspecified"
                ),
                "version": source.get("version", "Unknown"),
                "verified": source.get("verified", False),
                "file": filename,
                "chunk_index": index,
                "text": chunk_text,
            })

    output = {
        "knowledge_base": "MediSync Nexus Research Knowledge Base",
        "document_count": loaded_documents,
        "chunk_count": len(all_chunks),
        "chunk_size": CHUNK_SIZE,
        "chunk_overlap": CHUNK_OVERLAP,
        "chunks": all_chunks,
    }

    OUTPUT_FILE.write_text(
        json.dumps(output, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print("\nKnowledge base build completed.")
    print(f"Documents loaded: {loaded_documents}")
    print(f"Chunks created: {len(all_chunks)}")
    print(f"Output saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    build_knowledge_base()
