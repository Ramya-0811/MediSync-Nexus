
import { useState } from "react";

export default function Appointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [patientId, setPatientId] = useState("MSN-001");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");

  function createAppointment(event) {
    event.preventDefault();
    setMessage("");

    if (!patientId.trim() || !date || !time || !purpose.trim()) {
      setMessage("Please complete all appointment fields.");
      return;
    }

    const appointmentDate = new Date(`${date}T${time}`);

    if (Number.isNaN(appointmentDate.getTime())) {
      setMessage("Please enter a valid appointment date and time.");
      return;
    }

    if (appointmentDate <= new Date()) {
      setMessage("Please select a future date and time.");
      return;
    }

    const appointment = {
      id: `APT-${Date.now()}`,
      patient_id: patientId.trim(),
      date,
      time,
      purpose: purpose.trim(),
      doctor: user?.name || "Demo Doctor",
      status: "Scheduled",
    };

    setAppointments((previous) => [...previous, appointment]);
    setMessage("Simulated appointment created successfully.");

    setPatientId("MSN-001");
    setDate("");
    setTime("");
    setPurpose("");
  }

  function cancelAppointment(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this simulated appointment?"
    );

    if (!confirmed) return;

    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: "Cancelled" }
          : appointment
      )
    );

    setMessage("Appointment marked as cancelled.");
  }

  return (
    <section className="appointments-page">
      <p className="eyebrow">DOCTOR WORKSPACE</p>
      <h1>Appointments</h1>

      <p className="subtitle">
        Manage simulated appointments for the MediSync Nexus research prototype.
      </p>

      <section className="workflow">
        <h2>Create Appointment</h2>

        <form onSubmit={createAppointment}>
          <div className="arbitration-form">
            <label htmlFor="appointment-patient">Synthetic Patient ID</label>
            <input
              id="appointment-patient"
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              required
            />

            <label htmlFor="appointment-date">Date</label>
            <input
              id="appointment-date"
              type="date"
              min={new Date().toLocaleDateString("en-CA")}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <label htmlFor="appointment-time">Time</label>
            <input
              id="appointment-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />

            <label htmlFor="appointment-purpose">Purpose</label>
            <textarea
              id="appointment-purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Enter a simulated appointment purpose"
              rows={3}
              required
            />

            <button type="submit">Create Appointment</button>
          </div>
        </form>

        {message && (
          <p role="status" aria-live="polite">{message}</p>
        )}
      </section>

      <section className="workflow">
        <h2>Appointment Records</h2>

        <p>
          Total records: {appointments.length} | Scheduled:{" "}
          {appointments.filter((a) => a.status === "Scheduled").length} |
          Cancelled:{" "}
          {appointments.filter((a) => a.status === "Cancelled").length}
        </p>

        {appointments.length === 0 ? (
          <p>No simulated appointments have been created yet.</p>
        ) : (
          appointments.map((appointment) => (
            <article className="card" key={appointment.id}>
              <h3>{appointment.id}</h3>
              <p><strong>Patient ID:</strong> {appointment.patient_id}</p>
              <p><strong>Date:</strong> {appointment.date}</p>
              <p><strong>Time:</strong> {appointment.time}</p>
              <p><strong>Purpose:</strong> {appointment.purpose}</p>
              <p><strong>Doctor:</strong> {appointment.doctor}</p>
              <p><strong>Status:</strong> {appointment.status}</p>

              {appointment.status === "Scheduled" && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => cancelAppointment(appointment.id)}
                >
                  Cancel Appointment
                </button>
              )}
            </article>
          ))
        )}
      </section>

      <p className="disclaimer">
        Academic Research Prototype • Simulated Data • Not for Clinical Use
      </p>
    </section>
  );
}
