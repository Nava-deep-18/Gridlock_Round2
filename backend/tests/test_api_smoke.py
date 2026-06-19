import io
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from backend.main import app


class BackendApiSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.repo_root = Path(__file__).resolve().parents[2]

    def test_historical_endpoints_are_available(self):
        endpoints = [
            "/api/health",
            "/api/stats",
            "/api/hotspots",
            "/api/recommendations",
            "/api/heatmap",
            "/api/summary/station",
            "/api/summary/temporal",
            "/api/summary/vehicle",
        ]

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, 200, response.text)

    def test_upload_reprocesses_sample_data(self):
        sample_path = self.repo_root / "sample_data" / "sample_upload.csv"

        with sample_path.open("rb") as sample_file:
            response = self.client.post(
                "/api/upload",
                files={"file": ("sample_upload.csv", sample_file, "text/csv")},
            )

        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["mode"], "new_data")

        health = self.client.get("/api/health?mode=new_data")
        self.assertEqual(health.status_code, 200, health.text)
        self.assertEqual(health.json()["status"], "ok")

    def test_upload_rejects_invalid_schema(self):
        response = self.client.post(
            "/api/upload",
            files={"file": ("bad.csv", io.BytesIO(b"id,latitude\n1,12.9\n"), "text/csv")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required columns", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
