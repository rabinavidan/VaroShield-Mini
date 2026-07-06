from automation.clients.base_client import BaseClient


class DashboardClient(BaseClient):
    def get_summary(self) -> dict:
        response = self.get("/dashboard/summary")
        response.raise_for_status()
        return response.json()
