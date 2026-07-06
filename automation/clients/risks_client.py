from typing import Optional

import allure

from automation.clients.base_client import BaseClient


class RisksClient(BaseClient):
    @allure.step("Get risks (severity={severity}, status={status}, file_id={file_id})")
    def get_risks(
        self,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        file_id: Optional[int] = None,
    ) -> list:
        params = {}
        if severity:
            params["severity"] = severity
        if status:
            params["status"] = status
        if file_id:
            params["file_id"] = file_id

        response = self.get("/risks", params=params)
        response.raise_for_status()
        return response.json()
