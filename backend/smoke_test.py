
import json
import urllib.error
import urllib.request

BASE_URL = "http://127.0.0.1:8000"
PATIENT_ID = "MSN-001"


def request_json(path, method="GET", payload=None):
    url = BASE_URL + path
    data = None
    headers = {}

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(
        url,
        data=data,
        headers=headers,
        method=method,
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode("utf-8")
        parsed = json.loads(body) if body else {}
        return response.status, parsed


def run_test(name, test_function):
    try:
        test_function()
        print(f"PASS: {name}")
        return True
    except Exception as error:
        print(f"FAIL: {name} - {error}")
        return False


def test_health():
    status, data = request_json("/health")
    assert status == 200, f"Unexpected HTTP status: {status}"
    assert data.get("status") == "healthy", data


def test_patient_list():
    status, data = request_json("/patients")
    assert status == 200, f"Unexpected HTTP status: {status}"
    assert isinstance(data, (list, dict)), type(data)


def test_patient_twin():
    status, data = request_json(
        f"/patients/{PATIENT_ID}/twin"
    )
    assert status == 200, f"Unexpected HTTP status: {status}"
    assert data.get("patient_id") == PATIENT_ID, data
    assert "disclaimer" in data, "Safety disclaimer is missing"


def test_analysis():
    status, data = request_json(
        f"/patients/{PATIENT_ID}/analysis"
    )
    assert status == 200, f"Unexpected HTTP status: {status}"
    assert data.get("overall_status") == "completed", data
    assert data.get("agent_count") == 4, data

    agents = data.get("agents", [])
    assert len(agents) == 4, (
        f"Expected 4 agents, found {len(agents)}"
    )

    assert "evidence_retrieval" in data, (
        "Evidence retrieval report is missing"
    )
    assert "evidence_summary" in data, (
        "Evidence summary is missing"
    )

    summary = data["evidence_summary"]
    assert summary.get("rag_enabled") is False, (
        "RAG status should remain false for keyword retrieval"
    )
    assert summary.get("clinical_accuracy_verified") is False, (
        "Clinical accuracy must not be marked verified"
    )

    quality = data["evidence_retrieval"].get(
        "quality_assessment"
    )
    assert isinstance(quality, dict), (
        "Evidence quality assessment is missing"
    )


def test_demo_doctor_login():
    status, data = request_json(
        "/login",
        method="POST",
        payload={
            "email": "doctor@medisync.demo",
            "password": "doctor123",
            "role": "doctor",
        },
    )
    assert status == 200, f"Unexpected HTTP status: {status}"
    assert data.get("role") == "doctor", data


def main():
    tests = [
        ("Backend health", test_health),
        ("Patient list", test_patient_list),
        ("Digital Patient Twin", test_patient_twin),
        ("Four-agent analysis and evidence report", test_analysis),
        ("Demo doctor login", test_demo_doctor_login),
    ]

    print("\nMediSync Nexus - Week 7 Integration Tests\n")

    passed = 0

    for name, test_function in tests:
        if run_test(name, test_function):
            passed += 1

    failed = len(tests) - passed

    print("\n--- Test Summary ---")
    print(f"Passed: {passed}/{len(tests)}")
    print(f"Failed: {failed}/{len(tests)}")

    if failed:
        print(
            "Review the failed test and its error message "
            "before continuing."
        )
    else:
        print("All backend smoke tests passed.")


if __name__ == "__main__":
    main()
