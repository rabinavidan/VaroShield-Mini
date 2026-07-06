import allure
import pytest

from automation.utils.test_data import non_sensitive_content, unique_name


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Admin can update file permissions")
@pytest.mark.api
@pytest.mark.permissions
def test_admin_can_update_file_permissions(files_client):
    with allure.step("Create a file as admin"):
        file_item = files_client.create_file(
            name=unique_name("perm-file"),
            content=non_sensitive_content(),
            owner="finance",
            is_public=False,
        )

    with allure.step("Grant read access to the everyone group"):
        permission = files_client.set_permission(file_item["id"], "everyone", "read")
        allure.attach(str(permission), name="permission-response")

    assert permission["file_id"] == file_item["id"]
    assert permission["user_group"] == "everyone"
    assert permission["access"] == "read"


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Regular user cannot update file permissions")
@pytest.mark.api
@pytest.mark.permissions
def test_regular_user_cannot_update_permissions(files_client, user_files_client):
    with allure.step("Create a file as admin"):
        file_item = files_client.create_file(
            name=unique_name("perm-blocked"),
            content=non_sensitive_content(),
            owner="finance",
            is_public=False,
        )

    with allure.step("Attempt to set permission as regular user"):
        response = user_files_client.set_permission_raw(file_item["id"], "everyone", "read")
        allure.attach(str(response.text), name="response-body")

    assert response.status_code == 403
