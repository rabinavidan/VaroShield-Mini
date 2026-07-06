import allure
import pytest

from automation.pages.dashboard_page import DashboardPage
from automation.pages.login_page import LoginPage
from automation.utils.config import config


@allure.severity(allure.severity_level.BLOCKER)
@allure.title("Admin can login through the UI")
@pytest.mark.ui
@pytest.mark.smoke
def test_admin_can_login(page, ui_base_url):
    login_page = LoginPage(page, ui_base_url)
    dashboard_page = DashboardPage(page, ui_base_url)

    with allure.step("Open login page and submit admin credentials"):
        login_page.open()
        login_page.login(config.admin_email, config.admin_password)

    with allure.step("Verify redirect to dashboard"):
        page.wait_for_selector('[data-testid="dashboard-total-files"]')
        allure.attach(page.url, name="current-url")

    assert dashboard_page.total_files_text() != ""
