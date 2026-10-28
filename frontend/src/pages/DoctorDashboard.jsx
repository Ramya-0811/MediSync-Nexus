import TreatmentArbitration from "./TreatmentArbitration";
import DrugInteractions from "./DrugInteractions";
import Guidelines from "./Guidelines";
import KnowledgeBase from "./KnowledgeBase";
import AIAnalysis from "./AIAnalysis";
import { useEffect, useState } from "react";
import { getPatients, getPatientAnalysis } from "../services/api";
import Patients from "./Patients";
import DigitalPatientTwin from "../components/DigitalPatientTwin";
import Reports from "./Reports";
import Appointments from "./Appointments";
import PatientChat from "./PatientChat";
const menuItems = [
  "Dashboard",
  "Patients",
  "Digital Patient Twin",
  "AI Analysis",
  "Knowledge Base",
  "Guidelines",
  "Drug Interactions",
  "Treatment Arbitration",
  "Reports",
  "Appointments",
  "Patient Chat",
  "Settings",
];

export default function DoctorDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
   
const [patientCount, setPatientCount] = useState(null);
const [patientError, setPatientError] = useState("");

const [analysisStatus, setAnalysisStatus] = useState("Loading...");
const [analysisError, setAnalysisError] = useState("");

const [evidenceStatus, setEvidenceStatus] = useState("Loading...");
const [evidenceError, setEvidenceError] = useState("");

useEffect(() => {
  async function loadDashboardData() {
    try {
      const data = await getPatients();

      const patientList = Array.isArray(data)
        ? data
        : Array.isArray(data.patients)
          ? data.patients
          : null;

      if (patientList) {
        setPatientCount(patientList.length);
        setPatientError("");
      } else if (Number.isFinite(data.total)) {
        setPatientCount(data.total);
        setPatientError("");
      } else {
        setPatientError("Patient count is unavailable.");
      }
    } catch (error) {
      setPatientError(error.message || "Unable to load patients.");
    }

    try {
      const analysis = await getPatientAnalysis("MSN-001");

      setAnalysisStatus(
        analysis.overall_status || analysis.status || "Response received"
      );
      setAnalysisError("");

      const hasEvidence =
        (Array.isArray(analysis.citations) && analysis.citations.length > 0) ||
        (Array.isArray(analysis.evidence) && analysis.evidence.length > 0) ||
        (Array.isArray(analysis.evidence_summary) &&
          analysis.evidence_summary.length > 0) ||
        (typeof analysis.evidence_summary === "string" &&
          analysis.evidence_summary.trim().length > 0);

      setEvidenceStatus(
        hasEvidence
          ? "Evidence details available"
          : "Check AI Analysis"
      );
      setEvidenceError("");
    } catch (error) {
      setAnalysisStatus("Unavailable");
      setAnalysisError(error.message || "Unable to load analysis.");
      setEvidenceStatus("Unavailable");
      setEvidenceError("Analysis evidence could not be checked.");
    }
  }

  loadDashboardData();
}, []);

  function handleNavigation(item) {
    const availablePages = [
      "Dashboard",
      "Patients",
      "Digital Patient Twin",
      "AI Analysis",
      "Knowledge Base",
      "Guidelines",
      "Drug Interactions",
      "Treatment Arbitration",
      "Reports",
      "Appointments",
      "Patient Chat",
    ];

    if (availablePages.includes(item)) {
      setActivePage(item);
    } else {
      alert(`${item} module will be implemented in a later week.`);
    }
  }

  return (
    <div className="portal">
      <header className="portal-header">
        <a
          className="brand"
          href="#dashboard"
          onClick={(event) => {
            event.preventDefault();
            setActivePage("Dashboard");
          }}
        >
          ✚ MediSync <strong>Nexus</strong>
        </a>

        <div className="user-area">
          <span>{user.name}</span>
          <button className="secondary-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="portal-layout">
        <aside className="portal-sidebar">
          <p className="sidebar-title">DOCTOR WORKSPACE</p>

          {menuItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${
                activePage === item ? "active" : ""
              }`}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </aside>

        <main className="portal-content">
          {activePage === "Dashboard" && (
            <>
              <p className="eyebrow">DOCTOR PORTAL</p>
              <h1>Welcome, {user.name}</h1>

              <p className="subtitle">
                Review simulated patient information and explore the
                clinical decision-support research workflow.
              </p>

              <div className="cards">
                
                
<article className="card">
  <span className="card-icon">♙</span>
  <p>Patients</p>
  <h3>
    {patientCount === null
      ? patientError
        ? "Unavailable"
        : "Loading..."
      : `${patientCount} Synthetic Records`}
  </h3>
  <small>
    {patientError ||
      "Patient count loaded from the Patients API."}
  </small>
</article>

                
<article className="card">
  <span className="card-icon">✳</span>
  <p>AI Analysis</p>
  <h3>{analysisStatus}</h3>
  <small>
    {analysisError ||
      "Analysis workflow status for synthetic patient MSN-001."}
  </small>
</article>


<article className="card">
  <span className="card-icon">◇</span>
  <p>Evidence Base</p>
  <h3>{evidenceStatus}</h3>
  <small>
    {evidenceError ||
      "Evidence availability is estimated from the analysis response. Review citations in AI Analysis."}
  </small>
</article>

                
              </div>

              <section className="workflow">
                <h2>Research workflow</h2>
                <div className="workflow-steps">
                  <span>Patient Context</span>
                  <b>→</b>
                  <span>AI Agents</span>
                  <b>→</b>
                  <span>Evidence</span>
                  <b>→</b>
                  <span>Doctor Review</span>
                </div>
              </section>
            </>
          )}

          {activePage !== "Dashboard" && (
            <>
              <button
                className="secondary-button"
                onClick={() => setActivePage("Dashboard")}
              >
                ← Back to Dashboard
              </button>

              {activePage === "Patients" && <Patients />}

              {activePage === "Digital Patient Twin" && (
                <DigitalPatientTwin />
              )}
              {activePage === "AI Analysis" && <AIAnalysis />}
              {activePage === "Knowledge Base" && <KnowledgeBase />}
              {activePage === "Guidelines" && <Guidelines />}
              {activePage === "Drug Interactions" && <DrugInteractions />}
              {activePage === "Treatment Arbitration" && <TreatmentArbitration />}
              {activePage === "Reports" && <Reports />}
              {activePage === "Appointments" && <Appointments user={user} />}
              {activePage === "Patient Chat" && (
  <PatientChat user={user} />
)}
            </>
          )}

          <p className="disclaimer">
            Academic Research Prototype • Simulated Data • Not for Clinical Use
          </p>
        </main>
      </div>
    </div>
  );
}
