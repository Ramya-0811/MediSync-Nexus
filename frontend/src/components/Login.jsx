
import { useState } from "react";

const API_URL = "http://localhost:8000";

export default function Login({ onLogin }) {
  const [role, setRole] = useState("doctor");
  const [email, setEmail] = useState("doctor@medisync.demo");
  const [password, setPassword] = useState("doctor123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function changeRole(nextRole) {
    setRole(nextRole);
    setEmail(
      nextRole === "doctor"
        ? "doctor@medisync.demo"
        : "patient@medisync.demo"
    );
    setPassword(nextRole === "doctor" ? "doctor123" : "patient123");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      onLogin(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that FastAPI is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">✚</div>
        <p className="eyebrow">CLINICAL INTELLIGENCE PLATFORM</p>
        <h1>MediSync <span>Nexus</span></h1>
        <p className="login-subtitle">
          Evidence-grounded clinical decision-support research
        </p>

        <div className="role-switch">
          <button
            type="button"
            className={role === "doctor" ? "selected" : ""}
            onClick={() => changeRole("doctor")}
          >
            Doctor
          </button>
          <button
            type="button"
            className={role === "patient" ? "selected" : ""}
            onClick={() => changeRole("patient")}
          >
            Patient
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="demo-info">
          <strong>Demo account</strong>
          <p>
            {role === "doctor"
              ? "doctor@medisync.demo / doctor123"
              : "patient@medisync.demo / patient123"}
          </p>
        </div>

        <p className="disclaimer">
          Academic research prototype · Simulated data · Not for clinical use
        </p>
      </section>
    </main>
  );
}
