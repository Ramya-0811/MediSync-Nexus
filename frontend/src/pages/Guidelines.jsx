
import { useState } from "react";
import { getPatientAnalysis } from "../services/api";
import "./Guidelines.css";

export default function Guidelines() {
  const [patientId, setPatientId] = useState("MSN-001");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadSources(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const data = await getPatientAnalysis(patientId.trim());
      setReport(data);
    } catch (err) {
      setError(err.message || "Could not load source information.");
    } finally {
      setLoading(false);
    }
  }

  const evidence = report?.evidence_retrieval?.cited_evidence ?? [];
  const summary = report?.evidence_summary ?? {};

  return (
    <section className="guidelines-page">
      <p className="eyebrow">SOURCE REVIEW</p>
      <h1>Guidelines & Source Registry</h1>
      <p className="subtitle">
        Review sources returned by the research workflow and check
        whether they are marked as verified.
      </p>

      <form className="guidelines-form" onSubmit={loadSources}>
        <label htmlFor="guideline-patient">Synthetic Patient ID</label>
        <input
          id="guideline-patient"
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check Sources"}
        </button>
      </form>

      {error && <p className="guidelines-error" role="alert">{error}</p>}

      {report && (
        <>
          <div className="guidelines-notice">
            <strong>Research limitation</strong>
            <p>
              Retrieved documents are not automatically validated medical
              guidelines. Verify the publisher, publication date, version,
              and source before clinical interpretation.
            </p>
          </div>

          <section className="guidelines-panel">
            <h2>Source Check Summary</h2>
            <p>
              <strong>Retrieval method:</strong>{" "}
              {summary.retrieval_method ?? "Not specified"}
            </p>
            <p>
              <strong>Evidence items:</strong>{" "}
              {summary.evidence_count ?? evidence.length}
            </p>
            <p>
              <strong>Clinical accuracy verified:</strong>{" "}
              {String(summary.clinical_accuracy_verified ?? false)}
            </p>
          </section>

          <h2>Retrieved Sources</h2>

          {evidence.length > 0 ? (
            evidence.map((source, index) => (
              <article
                className="guidelines-panel"
                key={source.chunk_id ?? source.document_id ?? index}
              >
                <h3>{source.title ?? "Untitled source"}</h3>
                <p>
                  <strong>Publisher/source:</strong>{" "}
                  {source.source_name ?? "Not specified"}
                </p>
                <p>
                  <strong>Document ID:</strong>{" "}
                  {source.document_id ?? "Not specified"}
                </p>
                <p>
                  <strong>Registry verification:</strong>{" "}
                  {source.verified === true
                    ? "Marked verified"
                    : "Not verified"}
                </p>
                <p>
                  {source.text ?? source.excerpt ?? "No text provided."}
                </p>
              </article>
            ))
          ) : (
            <section className="guidelines-panel">
              <h3>No cited sources returned</h3>
              <p>
                Try another synthetic patient ID or inspect the API response.
                The current prototype may not have matching evidence.
              </p>
            </section>
          )}
        </>
      )}

      <p className="guidelines-disclaimer">
        Academic Research Prototype • Simulated Data • Not for Clinical Use
      </p>
    </section>
  );
}
