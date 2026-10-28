
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function DigitalPatientTwin() {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [twin, setTwin] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingTwin, setLoadingTwin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await fetch(`${API_URL}/patients`);

        if (!response.ok) {
          throw new Error("Could not load patients.");
        }

        const data = await response.json();
        setPatients(data.patients || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPatients(false);
      }
    }

    loadPatients();
  }, []);

  async function viewTwin(patientId) {
    setSelectedId(patientId);
    setTwin(null);
    setError("");

    if (!patientId) {
      return;
    }

    setLoadingTwin(true);

    try {
      const response = await fetch(
        `${API_URL}/patients/${encodeURIComponent(patientId)}/twin`
      );

      if (!response.ok) {
        throw new Error("Could not load this patient's twin.");
      }

      setTwin(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTwin(false);
    }
  }

  return (
    <section className="twin-page">
      <div className="twin-heading">
        <div>
          <p className="eyebrow">PATIENT CONTEXT</p>
          <h2>Digital Patient Twin</h2>
          <p className="subtitle">
            A structured view of a synthetic patient record.
          </p>
        </div>

        <span className="twin-badge">Research Demo</span>
      </div>

      <div className="twin-selector">
        <label htmlFor="twin-patient">Select patient</label>

        {loadingPatients ? (
          <p>Loading synthetic patient records...</p>
        ) : (
          <select
            id="twin-patient"
            value={selectedId}
            onChange={(event) => viewTwin(event.target.value)}
          >
            <option value="">Choose a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.id} — {patient.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="twin-error">{error}</p>}
      {loadingTwin && <p>Loading patient twin...</p>}

      {!twin && !loadingTwin && !error && (
        <div className="twin-empty">
          <h3>Select a synthetic patient to begin</h3>
          <p>
            Patient details, history, and observations will appear here.
          </p>
        </div>
      )}

      {twin && (
        <>
          <div className="twin-profile">
            <div className="twin-avatar">
              {twin.patient_name?.charAt(0) || "P"}
            </div>

            <div className="twin-profile-info">
              <h3>{twin.patient_name}</h3>
              <p>{twin.patient_id} · Synthetic patient</p>
            </div>

            <span className="twin-status">{twin.twin_status}</span>
          </div>

          <div className="twin-stats">
            <article className="twin-stat">
              <span>Age</span>
              <strong>{twin.age}</strong>
            </article>

            <article className="twin-stat">
              <span>Sex</span>
              <strong>{twin.sex}</strong>
            </article>

            <article className="twin-stat">
              <span>Record status</span>
              <strong>{twin.status}</strong>
            </article>
          </div>

          <section className="twin-section">
            <h3>Recorded condition</h3>
            <div className="twin-condition">
              {twin.condition}
            </div>
          </section>

          <section className="twin-section">
            <h3>Patient history timeline</h3>

            <div className="twin-timeline">
              {twin.medical_history?.length ? (
                twin.medical_history.map((item, index) => (
                  <div className="timeline-item" key={index}>
                    <span className="timeline-dot" />
                    <div>
                      <strong>History entry {index + 1}</strong>
                      <p>{item}</p>
                      <small>Synthetic demonstration data</small>
                    </div>
                  </div>
                ))
              ) : (
                <p>No history entries available.</p>
              )}
            </div>
          </section>

          <section className="twin-section">
            <h3>Observations</h3>

            {twin.observations?.length ? (
              <div className="twin-observation-grid">
                {twin.observations.map((item, index) => (
                  <article className="twin-observation" key={index}>
                    <span className="observation-label">
                      {item.name}
                    </span>
                    <strong>{item.value}</strong>
                    <small>{item.recorded_at}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p>No observations available.</p>
            )}
          </section>

          <section className="twin-section">
            <h3>Twin summary</h3>
            <p>{twin.summary}</p>
          </section>

          <p className="twin-disclaimer">
            {twin.disclaimer}
          </p>
        </>
      )}
    </section>
  );
}
