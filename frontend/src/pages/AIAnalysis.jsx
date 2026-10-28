import "./AIAnalysis.css";
import { useState } from "react";
import { getPatientAnalysis } from "../services/api";

export default function AIAnalysis() {
  const [patientId, setPatientId] = useState("MSN-001");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis(event) {
    event.preventDefault();
    if (!patientId.trim()) {
      setError("Enter a patient ID.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const result = await getPatientAnalysis(patientId.trim());
      setReport(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const agents = Array.isArray(report?.agents) ? report.agents : [];
  const evidence = report?.evidence_retrieval;
  const summary = report?.evidence_summary;

  return (
    <section className="ai-analysis-page">
      <p className="eyebrow">RESEARCH WORKFLOW</p>
      <h1>Multi-Agent AI Analysis</h1>
      <p className="subtitle">
        Review the outputs of the MediSync Nexus research agents
        for a synthetic patient record.
      </p>

      <form onSubmit={runAnalysis} className="analysis-search">
        <label htmlFor="analysis-patient-id">Patient ID</label>
        <input
          id="analysis-patient-id"
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          placeholder="Example: MSN-001"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Running..." : "Run Analysis"}
        </button>
      </form>

      {loading && <p>Running the analysis workflow...</p>}

      {error && (
        <div className="analysis-error" role="alert">
          {error}
        </div>
      )}

      {report && (
        <>
          <section className="analysis-panel">
            <h2>Workflow Summary</h2>
            <p>
              <strong>Patient ID:</strong>{" "}
              {report.patient_id ?? patientId}
            </p>
            <p>
              <strong>Workflow:</strong>{" "}
              {report.workflow_name ??
                report.workflow ??
                "MediSync Nexus Multi-Agent Analysis"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {report.overall_status ?? "Not specified"}
            </p>
            <p>
              <strong>Agents reported:</strong>{" "}
              {report.agent_count ?? agents.length}
            </p>
          </section>

          <h2>Agent Results</h2>

          {agents.length > 0 ? (
            <div className="analysis-agent-grid">
              {agents.map((agent, index) => (
                <article
                  className="analysis-panel"
                  key={agent.agent_name ?? agent.name ?? index}
                >
                  <h3>
                    {agent.agent_name ??
                      agent.name ??
                      `Agent ${index + 1}`}
                  </h3>
                  <p>
                    <strong>Status:</strong>{" "}
                    {agent.status ?? "Not specified"}
                  </p>
                  <pre>
                    {JSON.stringify(agent, null, 2)}
                  </pre>
                </article>
              ))}
            </div>
          ) : (
            <p>No agent results were returned by the API.</p>
          )}

          <section className="analysis-panel">
            <h2>Evidence Summary</h2>
            <p>
              <strong>Retrieval method:</strong>{" "}
              {summary?.retrieval_method ?? "Not specified"}
            </p>
            <p>
              <strong>Retrieval available:</strong>{" "}
              {String(
                summary?.evidence_database_connected ?? false
              )}
            </p>
            <p>
              <strong>Full RAG enabled:</strong>{" "}
              {String(summary?.rag_enabled ?? false)}
            </p>
            <p>
              <strong>Citations available:</strong>{" "}
              {String(summary?.citations_available ?? false)}
            </p>
            <p>
              <strong>Evidence items:</strong>{" "}
              {summary?.evidence_count ?? 0}
            </p>
            <p>
              <strong>Items needing review:</strong>{" "}
              {summary?.quality_items_needing_review ?? 0}
            </p>
            <p>
              <strong>Clinical accuracy verified:</strong>{" "}
              {String(
                summary?.clinical_accuracy_verified ?? false
              )}
            </p>
          </section>

          <section className="analysis-panel">
            <h2>Retrieved Evidence and Citations</h2>

            {Array.isArray(evidence?.cited_evidence) &&
            evidence.cited_evidence.length > 0 ? (
              evidence.cited_evidence.map((item, index) => (
                <article
                  className="evidence-item"
                  key={
                    item.chunk_id ??
                    item.citation ??
                    index
                  }
                >
                  <h3>{item.title ?? "Untitled source"}</h3>
                  <p>
                    <strong>Document ID:</strong>{" "}
                    {item.document_id ?? "Unavailable"}
                  </p>
                  <p>
                    <strong>Chunk ID:</strong>{" "}
                    {item.chunk_id ?? "Unavailable"}
                  </p>
                  <p>
                    <strong>Source:</strong>{" "}
                    {item.source_name ?? "Unknown"}
                  </p>
                  <p>
                    <strong>Verified in registry:</strong>{" "}
                    {String(item.verified ?? false)}
                  </p>
                  <p>
                    {item.text ?? item.excerpt ?? "No evidence text returned."}
                  </p>
                  {item.citation && (
                    <p>
                      <strong>Citation:</strong> {item.citation}
                    </p>
                  )}
                </article>
              ))
            ) : (
              <p>
                {evidence?.message ??
                  "No cited evidence was returned for this analysis."}
              </p>
            )}
          </section>

          <section className="analysis-warning">
            <h2>Safety and Review</h2>
            <p>
              This report is generated from a research workflow
              and synthetic data. It does not establish clinical
              accuracy or treatment suitability. A qualified
              clinician must independently review any real-world
              clinical decisions.
            </p>
            <p>
              {report.final_note ??
                "Academic Research Prototype • Simulated Data • Not for Clinical Use"}
            </p>
          </section>
        </>
      )}
    </section>
  );
}
