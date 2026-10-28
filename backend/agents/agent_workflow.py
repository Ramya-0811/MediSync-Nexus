
from typing import Any


def patient_context_agent(patient: dict) -> dict:
    required_fields = [
        "patient_id",
        "patient_name",
        "age",
        "sex",
        "condition",
        "status",
    ]

    missing_fields = [
        field
        for field in required_fields
        if patient.get(field) is None
        or patient.get(field) == ""
    ]

    return {
        "agent": "Patient Context Agent",
        "status": "completed",
        "findings": {
            "patient_id": patient.get("patient_id", "Unknown"),
            "patient_name": patient.get("patient_name", "Unknown"),
            "age": patient.get("age"),
            "sex": patient.get("sex", "Not recorded"),
            "condition": patient.get(
                "condition", "Not recorded"
            ),
            "record_status": patient.get("status", "Unknown"),
            "missing_fields": missing_fields,
            "data_complete": len(missing_fields) == 0,
        },
        "message": (
            "Patient information organised successfully."
            if not missing_fields
            else "Some patient information is missing."
        ),
    }


def observation_agent(patient: dict) -> dict:
    observations = patient.get("observations", [])

    if not isinstance(observations, list):
        observations = []

    valid_observations = [
        item
        for item in observations
        if isinstance(item, dict)
    ]

    return {
        "agent": "Observation Agent",
        "status": "completed",
        "findings": {
            "observation_count": len(valid_observations),
            "observations": valid_observations,
            "observations_available": (
                len(valid_observations) > 0
            ),
        },
        "message": (
            "Observations listed successfully."
            if valid_observations
            else "No valid observations are available."
        ),
        "note": (
            "Observations are displayed for research purposes. "
            "No clinical interpretation was performed."
        ),
    }

def safety_agent(patient: dict) -> dict:
    warnings = []

    if patient.get("data_type") != "Synthetic demo data":
        warnings.append(
            "Data source is not confirmed as synthetic demo data."
        )

    if not patient.get("medical_history"):
        warnings.append("Medical history is missing.")

    if not patient.get("observations"):
        warnings.append("No observations are available.")

    if not patient.get("patient_id"):
        warnings.append("Patient identifier is missing.")

    warnings.append(
        "Doctor review is required. This prototype does not "
        "provide clinical safety clearance."
    )

    return {
        "agent": "Safety Agent",
        "status": "completed",
        "findings": {
            "warnings": warnings,
            "warning_count": len(warnings),
            "clinical_clearance": False,
            "doctor_review_required": True,
        },
        "message": "Data limitations and review requirements checked.",
    }

def evidence_readiness_agent(patient: dict) -> dict:
    return {
        "agent": "Evidence Readiness Agent",
        "status": "completed",
        "findings": {
            "patient_id": patient.get("patient_id", "Unknown"),
            "evidence_database_connected": False,
            "rag_enabled": False,
            "citations_available": False,
            "next_step": (
                "Connect a research knowledge base and implement "
                "RAG retrieval with source citations in Week 6."
            ),
        },
        "message": (
            "Evidence retrieval is not connected yet. "
            "RAG and citations are planned for Week 6."
        ),
    }

def run_multi_agent_workflow(patient: dict) -> dict:
    # Run the four existing agents
    agents = [
        patient_context_agent(patient),
        observation_agent(patient),
        safety_agent(patient),
        evidence_readiness_agent(patient),
    ]

    # Find each agent's output
    agent_results = {
        agent["agent"]: agent
        for agent in agents
    }

    patient_context = agent_results["Patient Context Agent"]
    observation_result = agent_results["Observation Agent"]
    safety_result = agent_results["Safety Agent"]
    evidence_result = agent_results["Evidence Readiness Agent"]

    # Extract findings
    patient_findings = patient_context.get("findings", {})
    observation_findings = observation_result.get("findings", {})
    safety_findings = safety_result.get("findings", {})
    evidence_findings = evidence_result.get("findings", {})

    warnings = safety_findings.get("warnings", [])

    # Prepare a readable final report
    report = {
        "report_title": "MediSync Nexus Multi-Agent Analysis Report",
        "patient_id": patient.get("patient_id", "Unknown"),
        "overall_status": "completed",
        "agent_count": len(agents),

        "patient_summary": {
            "patient_id": patient_findings.get(
                "patient_id", "Unknown"
            ),
            "patient_name": patient_findings.get(
                "patient_name", "Unknown"
            ),
            "age": patient_findings.get("age"),
            "sex": patient_findings.get("sex", "Not recorded"),
            "condition": patient_findings.get(
                "condition", "Not recorded"
            ),
            "record_status": patient_findings.get(
                "record_status", "Unknown"
            ),
            "data_complete": patient_findings.get(
                "data_complete", False
            ),
            "missing_fields": patient_findings.get(
                "missing_fields", []
            ),
        },

        "observation_summary": {
            "observation_count": observation_findings.get(
                "observation_count", 0
            ),
            "observations_available": observation_findings.get(
                "observations_available", False
            ),
            "observations": observation_findings.get(
                "observations", []
            ),
        },

        "safety_summary": {
            "warning_count": safety_findings.get(
                "warning_count", len(warnings)
            ),
            "warnings": warnings,
            "clinical_clearance": False,
            "doctor_review_required": True,
        },

        "evidence_summary": {
            "evidence_database_connected": evidence_findings.get(
                "evidence_database_connected", False
            ),
            "rag_enabled": evidence_findings.get(
                "rag_enabled", False
            ),
            "citations_available": evidence_findings.get(
                "citations_available", False
            ),
            "next_step": evidence_findings.get(
                "next_step",
                "Connect the research knowledge base."
            ),
        },

        # Keep the original detailed agent results
        "agents": agents,

        "next_steps": [
            "Review the synthetic patient information.",
            "Check missing fields and data limitations.",
            "Connect RAG retrieval and source citations in Week 6.",
            "Require appropriate human review; do not use this report "
            "as a clinical decision.",
        ],

        "final_note": (
            "Academic Research Prototype. Simulated Data. "
            "Not for Clinical Use. This report is not a diagnosis "
            "or treatment recommendation."
        ),
    }

    return report
