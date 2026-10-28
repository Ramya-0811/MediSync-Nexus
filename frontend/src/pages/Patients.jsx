import "./Patients.css";
import { useEffect, useState } from "react";
import {
  getPatients,
  getPatientTwin,
  getPatientAnalysis,
} from "../services/api";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  async function loadPatients(searchTerm = "") {
    setLoading(true);
    setError("");

    try {
      const result = await getPatients(searchTerm);

      // Support either a plain list or a wrapped API response.
      const list = Array.isArray(result)
        ? result
        : result.patients;

      if (!Array.isArray(list)) {
        throw new Error(
          "Unexpected patient API response. Check GET /patients."
        );
      }

      setPatients(list);
    } catch (err) {
      setError(err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  async function openPatient(patient, view) {
    const patientId = patient.id ?? patient.patient_id;

    if (!patientId) {
      setDetailError("This patient record has no patient ID.");
      return;
    }

    setDetailLoading(true);
    setDetailError("");
    setSelected(null);

    try {
      const data =
        view === "twin"
          ? await getPatientTwin(patientId)
          : await getPatientAnalysis(patientId);

      setSelected({
        view,
        data,
      });
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <main className="patients-page">
      <header>
        <h1>Patients</h1>
        <p>
          Search synthetic patient records and open their
          research views.
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          loadPatients(search);
        }}
        className="patient-search"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by patient name or ID"
          aria-label="Search patients"
        />
        <button type="submit">Search</button>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            loadPatients("");
          }}
        >
          Clear
        </button>
      </form>

      {loading && <p>Loading patients...</p>}

      {error && (
        <div role="alert" className="patient-error">
          {error}
          <button onClick={() => loadPatients(search)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p>Records found: {patients.length}</p>

          <div className="patient-list">
            {patients.map((patient, index) => {
              const id = patient.id ?? patient.patient_id ?? index;
              const patientId = patient.id ?? patient.patient_id;

              return (
                <article
                  className="patient-card"
                  key={id}
                >
                  <h2>{patient.name ?? patient.patient_name ?? "Unnamed patient"}</h2>
                  <p>Patient ID: {patientId ?? "Unavailable"}</p>
                  <p>Age: {patient.age ?? "Not recorded"}</p>
                  <p>Sex: {patient.sex ?? "Not recorded"}</p>
                  <p>Condition: {patient.condition ?? "Not recorded"}</p>
                  <p>Status: {patient.status ?? "Unknown"}</p>

                  <div className="patient-actions">
                    <button
                      disabled={!patientId}
                      onClick={() => openPatient(patient, "twin")}
                    >
                      Digital Twin
                    </button>
                    <button
                      disabled={!patientId}
                      onClick={() => openPatient(patient, "analysis")}
                    >
                      AI Analysis
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {patients.length === 0 && (
            <p>No matching patient records found.</p>
          )}
        </>
      )}

      {detailLoading && <p>Loading patient details...</p>}

      {detailError && (
        <p role="alert" className="patient-error">
          {detailError}
        </p>
      )}

      {selected && (
        <section className="patient-result">
          <h2>
            {selected.view === "twin"
              ? "Digital Patient Twin"
              : "Multi-Agent AI Analysis"}
          </h2>

          <p>
            Patient:{" "}
            {selected.data.patient_name ??
              selected.data.patient_id ??
              "Research record"}
          </p>

          <pre>
            {JSON.stringify(selected.data, null, 2)}
          </pre>

          <button onClick={() => setSelected(null)}>
            Close details
          </button>
        </section>
      )}

      <footer className="research-disclaimer">
        Academic Research Prototype • Simulated Data •
        Not for Clinical Use
      </footer>
    </main>
  );
}
