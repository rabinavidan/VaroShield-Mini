from automation.clients.base_client import BaseClient


class AuthClient(BaseClient):
    def login(self, email: str, password: str) -> dict:
        response = self.post("/auth/login", json={"email": email, "password": password})
        return {"status_code": response.status_code, "body": self._safe_json(response)}

    @staticmethod
    def _safe_json(response) -> dict:
        try:
            return response.json()
        except ValueError:
            return {}
