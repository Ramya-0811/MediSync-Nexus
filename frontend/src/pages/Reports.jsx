
import { useEffect, useState } from "react";
import {
  getPatients,
  getPatientAnalysis,
  getArbitrationRecords,
} from "../services/api";

export default function Reports() {
  const [patientCount, setPatientCount] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      const problems = [];

      try {
        const result = await getPatients();

        const patients = Array.isArray(result)
          ? result
          : result.patients;

        if (Array.isArray(patients)) {
          if (!cancelled) setPatientCount(patients.length);
        } else if (Number.isFinite(result.total)) {
          if (!cancelled) setPatientCount(result.total);
        } else {
          problems.push("Patient count is unavailable.");
        }
      } catch (error) {
        problems.push(`Patients: ${error.message}`);
      }

      try {
        const result = await getPatientAnalysis("MSN-001");
        if (!cancelled) setAnalysis(result);
      } catch (error) {
        problems.push(`AI analysis: ${error.message}`);
      }

      try {
        const result = await getArbitrationRecords();

        if (Array.isArray(result.records)) {
          if (!cancelled) setRecords(result.records);
        } else {
          problems.push("Saved review records have an unexpected format.");
        }
      } catch (error) {
        problems.push(`Review records: ${error.message}`);
      }

      if (!cancelled) {
        setErrors(problems);
        setLoading(false);
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  function exportReport() {
    const report = {
      report_title: "MediSync Nexus Research Report",
      generated_at: new Date().toISOString(),
      disclaimer:
        "Academic Research Prototype. Simulated Data. Not for Clinical Use.",
      synthetic_patient_count: patientCount,
      sample_analysis: analysis,
      arbitration_records: records,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: "application/json;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "medisync-research-report.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="reports-page">
      <p className="eyebrow">RESEARCH WORKSPACE</p>
      <h1>Reports</h1>

      <p className="subtitle">
        Review available synthetic patient, analysis, and
        clinician-review data.
      </p>

      {loading && <p>Loading report data...</p>}

      {errors.length > 0 && (
        <section role="alert">
          <h2>Some report data could not be loaded</h2>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="cards">
        <article className="card">
          <span className="card-icon">♙</span>
          <p>Synthetic Patients</p>
          <h3>
            {patientCount === null ? "Unavailable" : patientCount}
          </h3>
          <small>Count returned by the Patients API.</small>
        </article>

        <article className="card">
          <span className="card-icon">✳</span>
          <p>Sample Analysis</p>
          <h3>
            {analysis
              ? analysis.overall_status || analysis.status || "Received"
              : "Unavailable"}
          </h3>
          <small>Analysis response for patient MSN-001.</small>
        </article>

        <article className="card">
          <span className="card-icon">◇</span>
          <p>Saved Review Records</p>
          <h3>{records.length}</h3>
          <small>Records returned by the arbitration API.</small>
        </article>
      </div>

      <section className="workflow">
        <h2>Analysis Summary</h2>

        {analysis ? (
          <>
            <p>
              <strong>Patient ID:</strong>{" "}
              {analysis.patient_id || "MSN-001"}
            </p>
            <p>
              <strong>Workflow:</strong>{" "}
              {analysis.workflow_name ||
                analysis.workflow ||
                "Multi-agent analysis"}
            </p>
            <p>
              <strong>Overall status:</strong>{" "}
              {analysis.overall_status ||
                analysis.status ||
                "Not specified"}
            </p>
            <p>
              <strong>Agent count:</strong>{" "}
              {analysis.agent_count ??
                (Array.isArray(analysis.agents)
                  ? analysis.agents.length
                  : "Not provided")}
            </p>
          </>
        ) : (
          <p>Analysis summary is unavailable.</p>
        )}

        <p>
          This summary describes a research workflow, not a
          verified medical conclusion.
        </p>
      </section>

      <section className="workflow">
        <h2>Saved Clinician Review Records</h2>

        {records.length === 0 ? (
          <p>No saved review records were returned.</p>
        ) : (
          records.map((record) => (
            <article
              className="card"
              key={record.record_id}
            >
              <h3>{record.record_id}</h3>
              <p>
                <strong>Patient ID:</strong> {record.patient_id}
              </p>
              <p>
                <strong>Status:</strong> {record.status}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {record.created_at
                  ? new Date(record.created_at).toLocaleString()
                  : "Not available"}
              </p>
            </article>
          ))
        )}
      </section>

      <button
        type="button"
        onClick={exportReport}
        disabled={loading}
      >
        Export Research Report (JSON)
      </button>

      <p className="disclaimer">
        Academic Research Prototype • Simulated Data • Not for Clinical Use
      </p>
    </section>
  );
}
