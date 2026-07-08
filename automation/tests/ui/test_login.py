import allure
import pytest

from automation.pages.dashboard_page import DashboardPage
from automation.pages.login_page import LoginPage
from automation.pages.navbar import Navbar
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
        dashboard_page.wait_for_load()
        allure.attach(page.url, name="current-url")

    assert dashboard_page.total_files_text() != ""


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Admin can log out through the navbar")
@pytest.mark.ui
@pytest.mark.smoke
def test_admin_can_logout(authenticated_page, ui_base_url):
    dashboard_page = DashboardPage(authenticated_page, ui_base_url)
    login_page = LoginPage(authenticated_page, ui_base_url)
    navbar = Navbar(authenticated_page)

    with allure.step("Open dashboard as an already-authenticated admin"):
        dashboard_page.open()
        navbar.wait_for_load()

    with allure.step("Log out via the navbar"):
        navbar.logout()

    with allure.step("Verify redirect to login page"):
        login_page.wait_for_load()
        allure.attach(authenticated_page.url, name="current-url")

    assert "/login" in authenticated_page.url
