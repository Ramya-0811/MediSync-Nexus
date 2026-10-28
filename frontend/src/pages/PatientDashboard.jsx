
export default function PatientDashboard({ user, onLogout }) {
  return (
    <div className="portal">
      <header className="portal-header">
        <a className="brand" href="#dashboard">
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
          <p className="sidebar-title">PATIENT WORKSPACE</p>
          {[
            "My Dashboard",
            "My Profile",
            "My Medical Details",
            "My Appointments",
            "Patient Chat",
            "Reviewed Reports",
            "Help & Support",
          ].map((item, index) => (
            <button
              key={item}
              className={`nav-item ${index === 0 ? "active" : ""}`}
              onClick={() => {
                if (index !== 0) {
                  alert(`${item} module will be implemented in a later week.`);
                }
              }}
            >
              {item}
            </button>
          ))}
        </aside>

        <main className="portal-content">
          <p className="eyebrow">PATIENT PORTAL</p>
          <h1>Hello, {user.name}</h1>
          <p className="subtitle">
            Your space for viewing approved health information and planned
            healthcare services.
          </p>

          <section className="status-banner">
            <div>
              <span className="status-dot" />
              <strong>Your research-demo account is active</strong>
            </div>
            <p>Welcome to your dashboard.</p>
            <small>
              No real medical records are connected to this demo account.
            </small>
          </section>

          <div className="cards">
            <article className="card">
              <span className="card-icon">♙</span>
              <p>My Profile</p>
              <h3>Coming soon</h3>
              <small>Profile details will be added in a later week.</small>
            </article>
            <article className="card">
              <span className="card-icon">▦</span>
              <p>Appointments</p>
              <h3>Coming soon</h3>
              <small>Appointment workflows are planned for Week 10.</small>
            </article>
            <article className="card">
              <span className="card-icon">▤</span>
              <p>Reviewed Reports</p>
              <h3>Coming soon</h3>
              <small>Only approved reports should be shown here.</small>
            </article>
          </div>

          <section className="workflow">
            <h2>Your information, with review</h2>
            <div className="workflow-steps">
              <span>Simulated Data</span>
              <b>→</b>
              <span>Doctor Review</span>
              <b>→</b>
              <span>Approved Information</span>
            </div>
          </section>

          <p className="disclaimer">
            Academic research prototype · Not for clinical use
          </p>
        </main>
      </div>
    </div>
  );
}
