from typing import Any, Optional

import requests

from automation.utils.logger import logger


class BaseClient:
    def __init__(self, base_url: str, token: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.token = token

    def _headers(self) -> dict:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        url = f"{self.base_url}{path}"
        response = requests.request(method, url, headers=self._headers(), **kwargs)

        if response.status_code >= 400:
            logger.error(
                "API call failed: %s %s -> %s %s",
                method,
                url,
                response.status_code,
                response.text,
            )

        return response

    def get(self, path: str, **kwargs) -> requests.Response:
        return self._request("GET", path, **kwargs)

    def post(self, path: str, json: Optional[Any] = None, **kwargs) -> requests.Response:
        return self._request("POST", path, json=json, **kwargs)
