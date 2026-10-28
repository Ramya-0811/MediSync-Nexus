
import { useMemo, useState } from "react";
import "./PatientChat.css";

const demoPatients = [
  {
    id: "MSN-001",
    name: "Aarav Sharma",
    initials: "AS",
    category: "Research patient",
    status: "Online (demo)",
  },
  {
    id: "MSN-002",
    name: "Priya Kumar",
    initials: "PK",
    category: "Research patient",
    status: "Offline (demo)",
  },
  {
    id: "MSN-003",
    name: "Rahul Patel",
    initials: "RP",
    category: "Research patient",
    status: "Online (demo)",
  },
];

function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const initialMessages = {
  "MSN-001": [
    {
      id: 1,
      sender: "patient",
      text: "Hello, doctor. I would like to discuss my recent health update.",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "doctor",
      text: "Hello! I can review your simulated patient record. What would you like to discuss?",
      time: "10:32 AM",
    },
  ],
  "MSN-002": [
    {
      id: 3,
      sender: "patient",
      text: "Hello, I have a question about my research record.",
      time: "09:15 AM",
    },
  ],
  "MSN-003": [],
};

export default function PatientChat({ user }) {
  const [selectedId, setSelectedId] = useState("MSN-001");
  const [patientSearch, setPatientSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messagesByPatient, setMessagesByPatient] =
    useState(initialMessages);

  const selectedPatient =
    demoPatients.find((patient) => patient.id === selectedId) ||
    demoPatients[0];

  const filteredPatients = demoPatients.filter((patient) =>
    `${patient.name} ${patient.id}`
      .toLowerCase()
      .includes(patientSearch.trim().toLowerCase())
  );

  const currentMessages = messagesByPatient[selectedId] || [];

  const filteredMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();

    if (!query) return currentMessages;

    return currentMessages.filter((item) =>
      item.text.toLowerCase().includes(query)
    );
  }, [currentMessages, messageSearch]);

  function sendMessage(event) {
    event.preventDefault();

    const text = message.trim();
    if (!text) return;

    const newMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender: "doctor",
      text,
      time: currentTime(),
    };

    setMessagesByPatient((previous) => ({
      ...previous,
      [selectedId]: [
        ...(previous[selectedId] || []),
        newMessage,
      ],
    }));

    setMessage("");
    setMessageSearch("");
  }

  return (
    <section className="patient-chat-page">
      <div className="chat-page-heading">
        <div>
          <p className="eyebrow">DOCTOR WORKSPACE / MESSAGING</p>
          <h1>Patient Chat</h1>
          <p className="subtitle">
            Manage conversations for simulated research patients.
          </p>
        </div>

        <span className="chat-demo-badge">
          <span className="chat-demo-dot" />
          DEMO ENVIRONMENT
        </span>
      </div>

      <div className="chat-dashboard">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-heading">
            <div>
              <h2>Conversations</h2>
              <p>{demoPatients.length} demo patients</p>
            </div>
            <span className="chat-count">
              {demoPatients.length}
            </span>
          </div>

          <div className="chat-search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search patients"
              placeholder="Search patients..."
              value={patientSearch}
              onChange={(event) =>
                setPatientSearch(event.target.value)
              }
            />
          </div>

          <div className="chat-patient-list">
            {filteredPatients.map((patient) => (
              <button
                type="button"
                key={patient.id}
                className={`chat-patient-item ${
                  selectedId === patient.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedId(patient.id);
                  setMessageSearch("");
                }}
              >
                <span className="chat-avatar">
                  {patient.initials}
                </span>

                <span className="chat-patient-summary">
                  <strong>{patient.name}</strong>
                  <small>{patient.id}</small>
                  <small className="chat-last-message">
                    {(messagesByPatient[patient.id] || []).at(-1)
                      ?.text || "No messages yet"}
                  </small>
                </span>

                <span
                  className={`chat-status-dot ${
                    patient.status.startsWith("Online")
                      ? "online"
                      : "offline"
                  }`}
                  title={patient.status}
                />
              </button>
            ))}

            {filteredPatients.length === 0 && (
              <p className="chat-empty">
                No matching demo patients found.
              </p>
            )}
          </div>

          <div className="chat-sidebar-note">
            <span aria-hidden="true">ⓘ</span>
            <p>
              Sample profiles only. These are not connected to real
              patient accounts.
            </p>
          </div>
        </aside>

        <section className="chat-conversation">
          <header className="chat-conversation-header">
            <div className="chat-selected-person">
              <span className="chat-avatar large">
                {selectedPatient.initials}
              </span>

              <div>
                <h2>{selectedPatient.name}</h2>
                <p>
                  {selectedPatient.id} · {selectedPatient.category}
                </p>
                <span
                  className={`chat-presence ${
                    selectedPatient.status.startsWith("Online")
                      ? "online"
                      : "offline"
                  }`}
                >
                  <span className="chat-status-dot" />
                  {selectedPatient.status}
                </span>
              </div>
            </div>

            <span className="chat-secure-label">
              <span aria-hidden="true">▣</span> Simulated chat
            </span>
          </header>

          <div className="chat-profile-strip">
            <div>
              <span className="chat-profile-icon">ID</span>
              <div>
                <small>Patient identifier</small>
                <strong>{selectedPatient.id}</strong>
              </div>
            </div>

            <div>
              <span className="chat-profile-icon">✓</span>
              <div>
                <small>Record type</small>
                <strong>Synthetic data</strong>
              </div>
            </div>
          </div>

          <div className="chat-message-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search messages in this conversation"
              placeholder="Find a message in this conversation..."
              value={messageSearch}
              onChange={(event) =>
                setMessageSearch(event.target.value)
              }
            />
            {messageSearch && (
              <button
                type="button"
                onClick={() => setMessageSearch("")}
                aria-label="Clear message search"
              >
                Clear
              </button>
            )}
          </div>

          <div
            className="chat-messages"
            aria-live="polite"
            aria-label="Conversation messages"
          >
            <div className="chat-date-divider">
              <span>Demo conversation</span>
            </div>

            {filteredMessages.map((item) => (
              <article
                key={item.id}
                className={`chat-message ${
                  item.sender === "doctor"
                    ? "doctor-message"
                    : "patient-message"
                }`}
              >
                <strong>
                  {item.sender === "doctor"
                    ? user?.name || "Doctor"
                    : selectedPatient.name}
                </strong>

                <p>{item.text}</p>
                <small>{item.time}</small>
              </article>
            ))}

            {filteredMessages.length === 0 && (
              <div className="chat-empty-state">
                <span aria-hidden="true">⌕</span>
                <strong>
                  {messageSearch
                    ? "No matching messages"
                    : "Start a conversation"}
                </strong>
                <p>
                  {messageSearch
                    ? "Try another search term."
                    : "Write a simulated message using the box below."}
                </p>
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={sendMessage}>
            <label htmlFor="chat-message">
              Message as {user?.name || "Doctor"}
            </label>

            <textarea
              id="chat-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={`Write a message about ${selectedPatient.id}...`}
              rows={3}
              maxLength={2000}
              required
            />

            <div className="chat-compose-footer">
              <span>{message.length}/2000 characters</span>
              <button
                type="submit"
                disabled={!message.trim()}
              >
                Send Message <span aria-hidden="true">➤</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="chat-safety-note">
        <span aria-hidden="true">ⓘ</span>
        <p>
          Academic Research Prototype · Simulated Data · Not for
          Clinical Use. Messages are stored in temporary browser
          memory only. No real patient is contacted.
        </p>
      </div>
    </section>
  );
}
