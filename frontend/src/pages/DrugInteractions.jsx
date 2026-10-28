
import { useState } from "react";
import "./DrugInteractions.css";

export default function DrugInteractions() {
  const [medications, setMedications] = useState("");
  const [checked, setChecked] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setChecked(true);
  }

  return (
    <section className="drug-page">
      <p className="eyebrow">MEDICATION SAFETY</p>
      <h1>Drug Interactions</h1>
      <p className="subtitle">
        Enter medications to prepare a list for review.
        This prototype does not validate drug interactions.
      </p>

      <form className="drug-form" onSubmit={handleSubmit}>
        <label htmlFor="medications">
          Medication names (separate with commas)
        </label>
        <textarea
          id="medications"
          value={medications}
          onChange={(event) => {
            setMedications(event.target.value);
            setChecked(false);
          }}
          placeholder="Example: Medication A, Medication B"
          rows={4}
          required
        />
        <button type="submit">Prepare Review List</button>
      </form>

      {checked && (
        <section className="drug-panel">
          <h2>Medication List</h2>
          <ul>
            {medications
              .split(",")
              .map((name) => name.trim())
              .filter(Boolean)
              .map((name, index) => (
                <li key={`${name}-${index}`}>{name}</li>
              ))}
          </ul>

          <p className="drug-warning">
            <strong>Clinical safety notice:</strong> No interaction check
            has been performed. This list does not identify safe or unsafe
            combinations. A qualified clinician or pharmacist must verify
            interactions using an appropriate, trusted clinical resource.
          </p>
        </section>
      )}

      <p className="drug-disclaimer">
        Academic Research Prototype • Simulated Data • Not for Clinical Use
      </p>
    </section>
  );
}
