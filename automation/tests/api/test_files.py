import allure
import pytest

from automation.utils.logger import logger
from automation.utils.test_data import safe_content, unique_name


@allure.severity(allure.severity_level.BLOCKER)
@allure.title("Admin can create a file")
@pytest.mark.api
@pytest.mark.smoke
def test_admin_can_create_file(files_client):
    name = unique_name("admin-created")

    with allure.step(f"Create file {name} as admin"):
        file_item = files_client.create_file(
            name=name, content=safe_content(), owner="finance", is_public=False
        )
        logger.info("Created file_id=%s", file_item["id"])
        allure.attach(str(file_item), name="created-file")

    assert file_item["name"] == name
    assert file_item["classification"] == "unknown"
    assert file_item["is_public"] is False


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Regular user cannot create a file")
@pytest.mark.api
@pytest.mark.permissions
def test_regular_user_cannot_create_file(user_files_client):
    with allure.step("Attempt to create file as regular user"):
        response = user_files_client.create_file_raw(
            name=unique_name("user-blocked"), content="x", owner="eng", is_public=False
        )
        allure.attach(str(response.text), name="response-body")

    assert response.status_code == 403


@allure.severity(allure.severity_level.NORMAL)
@allure.title("Created file appears in the files listing")
@pytest.mark.api
@pytest.mark.regression
def test_get_files_returns_created_file(files_client):
    name = unique_name("listed")

    with allure.step(f"Create file {name}"):
        created = files_client.create_file(
            name=name, content=safe_content(), owner="engineering", is_public=False
        )

    with allure.step("Fetch files list"):
        files = files_client.get_files()
        allure.attach(str(files), name="files-list")

    assert any(f["id"] == created["id"] and f["name"] == name for f in files)
