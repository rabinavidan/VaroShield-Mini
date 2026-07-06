import allure
import pytest

from automation.pages.dashboard_page import DashboardPage


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Dashboard shows summary cards")
@pytest.mark.ui
@pytest.mark.smoke
def test_dashboard_shows_summary_cards(authenticated_page, ui_base_url):
    dashboard_page = DashboardPage(authenticated_page, ui_base_url)

    with allure.step("Open dashboard page"):
        dashboard_page.open()
        authenticated_page.wait_for_selector('[data-testid="dashboard-total-files"]')

    with allure.step("Verify summary cards are visible"):
        allure.attach(dashboard_page.total_files_text(), name="total-files")

    assert dashboard_page.total_files_text() != ""
    assert dashboard_page.sensitive_files_text() != ""
    assert dashboard_page.high_risks_text() != ""


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Admin can start a scan from the dashboard")
@pytest.mark.ui
@pytest.mark.scan
def test_admin_can_start_scan_from_dashboard(authenticated_page, ui_base_url):
    dashboard_page = DashboardPage(authenticated_page, ui_base_url)

    with allure.step("Open dashboard and start a scan"):
        dashboard_page.open()
        authenticated_page.wait_for_selector('[data-testid="start-scan-button"]')
        dashboard_page.start_scan()

    with allure.step("Wait for scan to reach done status"):
        dashboard_page.wait_for_scan_done()
        allure.attach(dashboard_page.scan_status_text(), name="scan-status")

    assert "done" in dashboard_page.scan_status_text().lower()
