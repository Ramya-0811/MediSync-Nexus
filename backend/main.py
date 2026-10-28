import json
from pathlib import Path
from fastapi import HTTPException
from twin_models import DigitalPatientTwin
from agents.agent_workflow import run_multi_agent_workflow
from retrieve_evidence import retrieve_evidence
from citation_formatter import format_evidence_report
from evidence_quality import assess_evidence_list
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from arbitration_store import save_record, get_records

app = FastAPI(
    title="MediSync Nexus API",
    description="Academic clinical decision-support research prototype",
    version="0.1.0",
)

# Allow the local React development server to communicate
# with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to MediSync Nexus",
        "status": "running",
        "mode": "academic research prototype",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MediSync Nexus API",
    }


from pydantic import BaseModel
from fastapi import HTTPException


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


DEMO_USERS = {
    "doctor@medisync.demo": {
        "password": "doctor123",
        "role": "doctor",
        "name": "Dr. Demo",
    },
    "patient@medisync.demo": {
        "password": "patient123",
        "role": "patient",
        "name": "Demo Patient",
    },
}


@app.post("/login")
def login(request: LoginRequest):
    user = DEMO_USERS.get(request.email.lower())

    if (
        user is None
        or user["password"] != request.password
        or user["role"] != request.role.lower()
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email, password, or role",
        )

    return {
        "message": "Login successful",
        "email": request.email.lower(),
        "name": user["name"],
        "role": user["role"],
    }

PATIENTS_FILE = Path(__file__).parent / "data" / "patients.json"


def load_patients():
    if not PATIENTS_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Patient dataset not found. Run generate_patients.py first.",
        )

    with PATIENTS_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


@app.get("/patients")
def get_patients(search: str = ""):
    patients = load_patients()

    if search.strip():
        term = search.strip().lower()
        patients = [
            patient for patient in patients
            if term in patient["id"].lower()
            or term in patient["name"].lower()
            or term in patient["condition"].lower()
        ]

    return {
        "count": len(patients),
        "patients": patients,
    }


@app.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    patients = load_patients()

    for patient in patients:
        if patient["id"].lower() == patient_id.lower():
            return patient

    raise HTTPException(
        status_code=404,
        detail="Patient not found",
    )


@app.get(
    "/patients/{patient_id}/twin",
    response_model=DigitalPatientTwin,
)
def get_patient_twin(patient_id: str):
    patients = load_patients()

    patient = next(
        (
            item for item in patients
            if item["id"].lower() == patient_id.lower()
        ),
        None,
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # Simulated history and observations for demonstration only
    demo_history = [
        "Synthetic patient record created",
        "Example history entry for research demonstration",
    ]

    demo_observations = [
        {
            "name": "Example observation",
            "value": "Demo value - not a real measurement",
            "recorded_at": "2026-10-22",
        },
        {
            "name": "Record review status",
            "value": patient["status"],
            "recorded_at": "2026-10-22",
        },
    ]

    return DigitalPatientTwin(
        patient_id=patient["id"],
        patient_name=patient["name"],
        age=patient["age"],
        sex=patient["sex"],
        condition=patient["condition"],
        status=patient["status"],
        twin_status="Created",
        medical_history=demo_history,
        observations=demo_observations,
        summary=(
            "This twin combines a synthetic patient record "
            "with demonstration-only history and observations. "
            "It does not represent a clinical assessment."
        ),
    )



@app.get("/patients/{patient_id}/analysis")
def analyze_patient(patient_id: str):
    # 1. Load the existing Digital Patient Twin.
    twin = get_patient_twin(patient_id)

    if hasattr(twin, "model_dump"):
        patient_data = twin.model_dump()
    else:
        patient_data = twin.dict()

    # 2. Run all four existing agents.
    report = run_multi_agent_workflow(patient_data)

    # 3. Retrieve relevant project-policy evidence.
    evidence_query = (
        "simulated data doctor review "
        "source citations safety policy"
    )

    try:
        evidence_items = retrieve_evidence(
            evidence_query,
            top_k=3,
        )

        # 4. Format citations for retrieved evidence.
        evidence_report = format_evidence_report(
            evidence_query,
            evidence_items,
        )

        # 5. Assess source metadata and evidence completeness.
        quality_report = assess_evidence_list(
            evidence_items
        )

        evidence_report["quality_assessment"] = quality_report
        evidence_report["retrieval_available"] = True

    except (FileNotFoundError, ValueError) as error:
        # Preserve the analysis report if retrieval fails.
        evidence_report = format_evidence_report(
            evidence_query,
            [],
        )

        evidence_report["quality_assessment"] = (
            assess_evidence_list([])
        )

        evidence_report["retrieval_available"] = False
        evidence_report["message"] = (
            "Evidence retrieval failed. Check the "
            "knowledge-base files and registry."
        )
        evidence_report["retrieval_error"] = str(error)

    # 6. Attach evidence without removing agent findings.
    report["evidence_retrieval"] = evidence_report

    evidence_found = evidence_report.get(
        "evidence_found",
        False,
    )

    quality_report = evidence_report.get(
        "quality_assessment",
        {},
    )

    report["evidence_summary"] = {
        "evidence_database_connected": evidence_report.get(
            "retrieval_available",
            False,
        ),
        "retrieval_method": "Local keyword matching",
        "rag_enabled": False,
        "citations_available": evidence_found,
        "evidence_count": evidence_report.get(
            "cited_evidence_count",
            0,
        ),
        "quality_items_checked": quality_report.get(
            "items_checked",
            0,
        ),
        "quality_items_incomplete": quality_report.get(
            "incomplete_count",
            0,
        ),
        "quality_items_needing_review": quality_report.get(
            "needs_review_count",
            0,
        ),
        "clinical_accuracy_verified": False,
    }

    # 7. Preserve clear research and safety boundaries.
    report["final_note"] = (
        "Academic Research Prototype. Simulated Data. "
        "Not for Clinical Use. Evidence-quality checks assess "
        "metadata completeness only and do not establish "
        "clinical accuracy, diagnosis, or treatment suitability."
    )

    return report

from pydantic import BaseModel, Field


class ArbitrationRecordInput(BaseModel):
    patient_id: str = Field(min_length=1, max_length=50)
    option_a: str = Field(min_length=1, max_length=2000)
    option_b: str = Field(min_length=1, max_length=2000)
    review_notes: str = Field(min_length=1, max_length=4000)


@app.post("/arbitration")
def create_arbitration_record(payload: ArbitrationRecordInput):
    record = save_record(payload.model_dump())
    return {
        "message": "Review record saved",
        "record": record,
        "disclaimer": "Academic Research Prototype. Not for Clinical Use.",
    }


@app.get("/arbitration")
def list_arbitration_records():
    return {
        "records": get_records(),
        "disclaimer": "Simulated academic records only.",
    }


