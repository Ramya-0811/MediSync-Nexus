
import { useState } from "react";
import { getPatientAnalysis } from "../services/api";
import "./KnowledgeBase.css";

export default function KnowledgeBase() {
  const [patientId, setPatientId] = useState("MSN-001");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEvidence(event) {
    event.preventDefault();
    if (!patientId.trim()) {
      setError("Enter a patient ID.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await getPatientAnalysis(patientId.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to load evidence.");
    } finally {
      setLoading(false);
    }
  }

  const summary = result?.evidence_summary ?? {};
  const retrieval = result?.evidence_retrieval ?? {};

  const evidenceItems = [
    ...(Array.isArray(retrieval.cited_evidence)
      ? retrieval.cited_evidence
      : []),
    ...(Array.isArray(retrieval.evidence)
      ? retrieval.evidence
      : []),
  ];

  const uniqueEvidence = evidenceItems.filter(
    (item, index, items) =>
      index === items.findIndex(
        (other) =>
          (other.chunk_id ?? other.document_id ?? other.title) ===
          (item.chunk_id ?? item.document_id ?? item.title)
      )
  );

  return (
    <section className="knowledge-page">
      <p className="eyebrow">EVIDENCE MANAGEMENT</p>
      <h1>Knowledge Base</h1>
      <p className="subtitle">
        Explore evidence returned by the MediSync Nexus
        research retrieval workflow.
      </p>

      <form className="knowledge-search" onSubmit={loadEvidence}>
        <label htmlFor="kb-patient-id">Synthetic Patient ID</label>
        <input
          id="kb-patient-id"
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          placeholder="Example: MSN-001"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Retrieve Evidence"}
        </button>
      </form>

      {error && <p className="knowledge-error" role="alert">{error}</p>}

      {result && (
        <>
          <div className="knowledge-stats">
            <article className="knowledge-card">
              <span>Evidence Items</span>
              <strong>{summary.evidence_count ?? uniqueEvidence.length}</strong>
            </article>
            <article className="knowledge-card">
              <span>Citations Available</span>
              <strong>{String(summary.citations_available ?? false)}</strong>
            </article>
            <article className="knowledge-card">
              <span>Full RAG Enabled</span>
              <strong>{String(summary.rag_enabled ?? false)}</strong>
            </article>
          </div>

          <section className="knowledge-panel">
            <h2>Retrieval Information</h2>
            <p>
              <strong>Method:</strong>{" "}
              {summary.retrieval_method ?? "Not specified"}
            </p>
            <p>
              <strong>Patient ID:</strong> {result.patient_id ?? patientId}
            </p>
            <p>
              <strong>Clinical accuracy verified:</strong>{" "}
              {String(summary.clinical_accuracy_verified ?? false)}
            </p>
          </section>

          <h2>Retrieved Documents</h2>

          {uniqueEvidence.length > 0 ? (
            uniqueEvidence.map((item, index) => (
              <article
                className="knowledge-panel"
                key={item.chunk_id ?? item.document_id ?? index}
              >
                <h3>{item.title ?? "Evidence document"}</h3>
                <p>
                  <strong>Source:</strong> {item.source_name ?? "Not provided"}
                </p>
                <p>
                  <strong>Document ID:</strong>{" "}
                  {item.document_id ?? "Not provided"}
                </p>
                <p>
                  <strong>Chunk ID:</strong> {item.chunk_id ?? "Not provided"}
                </p>
                <p>
                  <strong>Verified in registry:</strong>{" "}
                  {String(item.verified ?? false)}
                </p>
                <p>{item.text ?? item.excerpt ?? "No text available."}</p>
                {item.citation && (
                  <p><strong>Citation:</strong> {item.citation}</p>
                )}
              </article>
            ))
          ) : (
            <section className="knowledge-panel">
              <h3>No evidence items returned</h3>
              <p>
                The API did not return documents in the expected fields.
                Check the analysis response and retrieval output.
              </p>
              {retrieval.message && <p>{retrieval.message}</p>}
            </section>
          )}
        </>
      )}

      <p className="knowledge-disclaimer">
        Academic Research Prototype • Simulated Data • Not for Clinical Use
      </p>
    </section>
  );
}
