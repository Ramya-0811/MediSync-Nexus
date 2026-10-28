import { useEffect, useState } from "react";
import "./TreatmentArbitration.css";
import {
  saveArbitrationRecord,
  getArbitrationRecords,
} from "../services/api";

export default function TreatmentArbitration() {
  const [patientId, setPatientId] = useState("MSN-001");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState("");

  const [records, setRecords] = useState([]);
  const [recordsError, setRecordsError] = useState("");
  const [recordsLoading, setRecordsLoading] = useState(true);

  const [searchPatient, setSearchPatient] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [exportMessage, setExportMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadRecords() {
      try {
        const result = await getArbitrationRecords();
        setRecords(result.records || []);
        setRecordsError("");
      } catch (error) {
        setRecordsError(error.message || "Unable to load records.");
      } finally {
        setRecordsLoading(false);
      }
    }

    loadRecords();
  }, []);
async function refreshRecords() {
  if (recordsLoading) return;

  setRecordsLoading(true);
  setRecordsError("");

  try {
    const result = await getArbitrationRecords();

    if (!result || !Array.isArray(result.records)) {
      throw new Error("Invalid records response from the server.");
    }

    setRecords(result.records);
  } catch (error) {
    setRecordsError(
      error.message || "Unable to refresh records. Please try again."
    );
  } finally {
    setRecordsLoading(false);
  }
}
  const filteredRecords = records.filter((record) => {
    const matchesPatient = (record.patient_id || "")
      .toLowerCase()
      .includes(searchPatient.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    return matchesPatient && matchesStatus;
  });

  function exportRecordsToCSV() {
    setExportMessage("");

    if (recordsLoading) {
      setExportMessage("Please wait while records are loading.");
      return;
    }

    if (recordsError) {
      setExportMessage("Records could not be loaded. Please try again.");
      return;
    }

    if (filteredRecords.length === 0) {
      setExportMessage("No matching records available to export.");
      return;
    }
    const confirmed = window.confirm(
  `Export ${filteredRecords.length} filtered review record(s) to CSV?`
);

if (!confirmed) {
  setExportMessage("Export cancelled.");
  return;
}
    const headers = [
      "Record ID",
      "Patient ID",
      "Status",
      "Option A",
      "Option B",
      "Review Notes",
      "Created At",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredRecords.map((record) => [
      record.record_id,
      record.patient_id,
      record.status,
      record.option_a,
      record.option_b,
      record.review_notes,
      record.created_at,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "medisync-arbitration-records.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setExportMessage(
      `Export prepared successfully: ${filteredRecords.length} record(s).`
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
const cleanedPatientId = patientId.trim();

if (!cleanedPatientId) {
  setDecision("Please enter a valid synthetic patient ID.");
  return;
}

    if (isSaving) return;

    setDecision("");

    
if (
  !patientId.trim() ||
  !optionA.trim() ||
  !optionB.trim() ||
  !reason.trim()
) {
  setDecision("Please complete all fields.");
  return;
}

if (optionA.trim().toLowerCase() === optionB.trim().toLowerCase()) {
  setDecision("Option A and Option B must contain different text.");
  return;
}


    setIsSaving(true);

    try {
      const result = await saveArbitrationRecord({
        patient_id: patientId.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        review_notes: reason.trim(),
      });

      setDecision(
        `Record saved successfully. Record ID: ${result.record.record_id}. Status: ${result.record.status}.`
      );

      const updated = await getArbitrationRecords();
      setRecords(updated.records || []);
      setRecordsError("");
    } catch (error) {
      setDecision(
        `Could not save or refresh records: ${
          error.message || "Please try again."
        }`
      );
    } finally {
      setIsSaving(false);
    }
  }
 
function resetForm() {
  const confirmed = window.confirm(
    "Are you sure you want to clear the form? Unsaved information will be lost."
  );

  if (!confirmed) {
    return;
  }

  setPatientId("MSN-001");
  setOptionA("");
  setOptionB("");
  setReason("");
  setDecision("");
}

  return (
    <section className="arbitration-page">
      <p className="eyebrow">CLINICAL DECISION SUPPORT</p>

      <h1>Treatment Arbitration</h1>

      <p className="subtitle">
        Compare simulated options and document a clinician's review.
        This page does not recommend or select medical treatments.
      </p>

      <form className="arbitration-form" onSubmit={handleSubmit}>
        <label htmlFor="patientId">Synthetic Patient ID</label>
        <input
          id="patientId"
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          required
        />

        <div className="arbitration-grid">
          <div>
            <label htmlFor="optionA">Review Option A</label>
            <textarea
              id="optionA"
              value={optionA}
              onChange={(event) => {
                setOptionA(event.target.value);
                setDecision("");
              }}
              placeholder="Enter a simulated option for clinician review"
              rows={4}
              required
            />
          </div>

          <div>
            <label htmlFor="optionB">Review Option B</label>
            <textarea
              id="optionB"
              value={optionB}
              onChange={(event) => {
                setOptionB(event.target.value);
                setDecision("");
              }}
              placeholder="Enter another simulated option for review"
              rows={4}
              required
            />
          </div>
        </div>

        <label htmlFor="reason">
          Review Notes and Evidence to Verify
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setDecision("");
          }}
          placeholder="Record uncertainties, evidence sources to check, and safety concerns."
          rows={4}
          required
        />

        <div className="arbitration-buttons">
  <button type="submit" disabled={isSaving}>
    {isSaving ? "Saving..." : "Prepare Review Record"}
  </button>

  <button
    type="button"
    onClick={resetForm}
    disabled={isSaving}
  >
    Reset Form
  </button>
</div>
      </form>

      {decision && (
        <div
          className="arbitration-result"
          role="status"
          aria-live="polite"
        >
          <h2>
            {decision.startsWith("Record saved successfully")
              ? "Review Record Saved"
              : "Review Record Status"}
          </h2>

          <p>
            <strong>Patient:</strong> {patientId}
          </p>
          <p>
            <strong>Option A:</strong> {optionA}
          </p>
          <p>
            <strong>Option B:</strong> {optionB}
          </p>
          <p>
            <strong>Review notes:</strong> {reason}
          </p>
          <p>{decision}</p>
        </div>
      )}

        <section className="saved-arbitrations">
  <h2>Saved Review Records</h2>

  <button
    type="button"
    onClick={refreshRecords}
    disabled={recordsLoading}
  >
    {recordsLoading ? "Refreshing..." : "Refresh Records"}
  </button>

        <button
          type="button"
          onClick={exportRecordsToCSV}
          disabled={recordsLoading || isSaving}
        >
          Export Filtered Records to CSV
        </button>

        {exportMessage && (
          <p role="status" aria-live="polite">
            {exportMessage}
          </p>
        )}

        
<div className="arbitration-filters">
  <input
    type="text"
    value={searchPatient}
    onChange={(event) => setSearchPatient(event.target.value)}
    placeholder="Search by Patient ID, e.g. MSN-001"
    aria-label="Search saved records by patient ID"
  />

  <select
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
    aria-label="Filter saved records by status"
  >
    <option value="all">All statuses</option>
    <option value="pending_clinician_review">
      Pending clinician review
    </option>
  </select>

  <button
    type="button"
    onClick={() => {
      setSearchPatient("");
      setStatusFilter("all");
    }}
  >
    Clear Filters
  </button>
</div>


        <div className="arbitration-summary">
          <p>
            <strong>Total saved records:</strong> {records.length}
          </p>

          <p>
            <strong>Matching records:</strong> {filteredRecords.length}
          </p>

          <p>
            <strong>Pending clinician review:</strong>{" "}
            {
              records.filter(
                (record) =>
                  record.status === "pending_clinician_review"
              ).length
            }
          </p>
          <p>
  <strong>Records status:</strong>{" "}
  {recordsLoading
    ? "Loading records..."
    : recordsError
      ? "Unable to load records"
      : "Records loaded successfully"}
</p>
        </div>

        {recordsLoading && <p>Loading saved records...</p>}

        {recordsError && (
          <p role="alert">
            Could not load records: {recordsError}
          </p>
        )}

        {!recordsLoading &&
          !recordsError &&
          filteredRecords.length === 0 && (
            <p>No matching review records found.</p>
          )}

        {filteredRecords.map((record) => (
          <article
            className="saved-arbitration"
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
              <strong>Option A:</strong> {record.option_a}
            </p>
            <p>
              <strong>Option B:</strong> {record.option_b}
            </p>
            <p>
              <strong>Review notes:</strong> {record.review_notes}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {record.created_at
                ? new Date(record.created_at).toLocaleString()
                : "Not available"}
            </p>
          </article>
        ))}
      </section>

      <p className="arbitration-disclaimer">
        Academic Research Prototype • Simulated Data • Not for Clinical Use
      </p>
    </section>
  );
}