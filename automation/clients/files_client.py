from typing import Optional

import allure
import requests

from automation.clients.base_client import BaseClient


class FilesClient(BaseClient):
    @allure.step("POST create file {name} (owner={owner}, is_public={is_public})")
    def create_file_raw(
        self, name: str, content: str, owner: str, is_public: bool = False
    ) -> requests.Response:
        return self.post(
            "/files",
            json={"name": name, "content": content, "owner": owner, "is_public": is_public},
        )

    @allure.step("Create file {name}")
    def create_file(
        self, name: str, content: str, owner: str, is_public: bool = False
    ) -> dict:
        response = self.create_file_raw(name, content, owner, is_public)
        response.raise_for_status()
        return response.json()

    @allure.step("Get files list")
    def get_files(self) -> list:
        response = self.get("/files")
        response.raise_for_status()
        return response.json()

    @allure.step("Get file {file_id}")
    def get_file(self, file_id: int) -> dict:
        response = self.get(f"/files/{file_id}")
        response.raise_for_status()
        return response.json()

    @allure.step("POST set permission for file {file_id}: {user_group}={access}")
    def set_permission_raw(
        self, file_id: int, user_group: str, access: str = "read"
    ) -> requests.Response:
        return self.post(
            f"/files/{file_id}/permissions",
            json={"user_group": user_group, "access": access},
        )

    @allure.step("Set permission for file {file_id}: {user_group}={access}")
    def set_permission(
        self, file_id: int, user_group: str, access: str = "read"
    ) -> dict:
        response = self.set_permission_raw(file_id, user_group, access)
        response.raise_for_status()
        return response.json()
