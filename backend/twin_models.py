
from pydantic import BaseModel
from typing import List


class PatientObservation(BaseModel):
    name: str
    value: str
    recorded_at: str


class DigitalPatientTwin(BaseModel):
    patient_id: str
    patient_name: str
    age: int
    sex: str
    condition: str
    status: str

    twin_status: str = "Created"
    data_type: str = "Synthetic demo data"

    medical_history: List[str] = []
    observations: List[PatientObservation] = []

    summary: str
    disclaimer: str = (
        "Academic Research Prototype - "
        "Simulated Data - Not for Clinical Use"
    )
