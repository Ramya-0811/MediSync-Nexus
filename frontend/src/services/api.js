
const API_BASE_URL = "http://127.0.0.1:8000";

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to MediSync Nexus backend. Check that FastAPI is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export function getPatients(search = "") {
  const query = search.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : "";

  return apiRequest(`/patients${query}`);
}

export function getPatientTwin(patientId) {
  return apiRequest(
    `/patients/${encodeURIComponent(patientId)}/twin`
  );
}

export function getPatientAnalysis(patientId) {
  return apiRequest(
    `/patients/${encodeURIComponent(patientId)}/analysis`
  );
}

export { apiRequest };
export function saveArbitrationRecord(record) {
  return apiRequest("/arbitration", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export function getArbitrationRecords() {
  return apiRequest("/arbitration");
}