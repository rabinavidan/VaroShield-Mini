from automation.utils.logger import logger
from automation.utils.polling import wait_until

from automation.clients.base_client import BaseClient


class ScanClient(BaseClient):
    def start_scan(self) -> dict:
        response = self.post("/scan/start")
        response.raise_for_status()
        job = response.json()
        logger.info("Started scan job_id=%s", job["job_id"])
        return job

    def get_scan_job(self, job_id: str) -> dict:
        response = self.get(f"/scan/{job_id}")
        response.raise_for_status()
        return response.json()

    def start_scan_and_wait(self, timeout: int = 60, interval: int = 2) -> dict:
        job = self.start_scan()
        result = wait_until(
            action=lambda: self.get_scan_job(job["job_id"]),
            condition=lambda response: response["status"] in ("done", "failed"),
            timeout=timeout,
            interval=interval,
            error_message=f"Scan job {job['job_id']} did not finish",
        )
        logger.info("Scan job_id=%s finished with status=%s", job["job_id"], result["status"])
        return result
