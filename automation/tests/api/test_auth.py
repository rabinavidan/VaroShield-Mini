import allure
import pytest

from automation.utils.config import config


@allure.severity(allure.severity_level.BLOCKER)
@allure.title("Admin can login and receives an admin token")
@pytest.mark.api
@pytest.mark.smoke
def test_admin_login_success(auth_client):
    with allure.step("Login as admin"):
        result = auth_client.login(config.admin_email, config.admin_password)
        allure.attach(str(result), name="login-response")

    assert result["status_code"] == 200
    assert result["body"]["role"] == "admin"
    assert result["body"]["token"] == config.admin_token


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Regular user can login and receives a user token")
@pytest.mark.api
@pytest.mark.smoke
def test_regular_user_login_success(auth_client):
    with allure.step("Login as regular user"):
        result = auth_client.login(config.user_email, config.user_password)
        allure.attach(str(result), name="login-response")

    assert result["status_code"] == 200
    assert result["body"]["role"] == "user"
    assert result["body"]["token"] == config.user_token


@allure.severity(allure.severity_level.NORMAL)
@allure.title("Login with invalid credentials is rejected")
@pytest.mark.api
@pytest.mark.regression
def test_login_invalid_credentials(auth_client):
    with allure.step("Login with wrong password"):
        result = auth_client.login(config.admin_email, "wrong-password")
        allure.attach(str(result), name="login-response")

    assert result["status_code"] == 401
