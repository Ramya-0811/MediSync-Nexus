
import { useState } from "react";
import Login from "./components/Login.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user.role === "doctor") {
    return <DoctorDashboard user={user} onLogout={handleLogout} />;
  }

  return <PatientDashboard user={user} onLogout={handleLogout} />;
}

export default App;
