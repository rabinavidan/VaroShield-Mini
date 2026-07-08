import allure
import pytest

from automation.pages.risks_page import RisksPage
from automation.utils.logger import logger
from automation.utils.test_data import sensitive_content, unique_name


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Risks page shows a HIGH risk alert")
@pytest.mark.ui
@pytest.mark.risks
@pytest.mark.smoke
def test_risks_page_shows_high_risk_alert(
    files_client, scan_client, authenticated_page, ui_base_url
):
    with allure.step("Create a public sensitive file via API"):
        file_item = files_client.create_file(
            name=unique_name("ui-high-risk"),
            content=sensitive_content(),
            owner="finance",
            is_public=True,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    risks_page = RisksPage(authenticated_page, ui_base_url)
    with allure.step("Open risks page"):
        risks_page.open()
        risks_page.wait_for_load()
        allure.attach(risks_page.risks_table_text(), name="risks-table")

    assert str(file_item["id"]) in risks_page.risks_table_text()
    assert "high" in risks_page.risks_table_text().lower()


@allure.severity(allure.severity_level.NORMAL)
@allure.title("User can filter risks by severity")
@pytest.mark.ui
@pytest.mark.risks
def test_user_can_filter_risks_by_severity(
    files_client, scan_client, authenticated_page, ui_base_url
):
    with allure.step("Create a public sensitive file via API"):
        file_item = files_client.create_file(
            name=unique_name("ui-filter"),
            content=sensitive_content(),
            owner="finance",
            is_public=True,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    risks_page = RisksPage(authenticated_page, ui_base_url)
    with allure.step("Open risks page and filter by high severity"):
        risks_page.open()
        risks_page.wait_for_load()
        risks_page.filter_by_severity("high")
        authenticated_page.wait_for_timeout(500)
        allure.attach(risks_page.risks_table_text(), name="filtered-risks-table")

    table_text = risks_page.risks_table_text().lower()
    assert "high" in table_text
    assert "low" not in table_text


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Admin can resolve a risk alert from the detail drawer")
@pytest.mark.ui
@pytest.mark.risks
@pytest.mark.smoke
def test_admin_can_resolve_risk_from_drawer(
    files_client, scan_client, authenticated_page, ui_base_url
):
    with allure.step("Create a public sensitive file via API"):
        file_item = files_client.create_file(
            name=unique_name("ui-resolve"),
            content=sensitive_content(),
            owner="finance",
            is_public=True,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    risks_page = RisksPage(authenticated_page, ui_base_url)
    with allure.step("Open risks page and find the alert for this file"):
        risks_page.open()
        risks_page.wait_for_load()
        risk_id = risks_page.find_row_id(file_item["id"])

    with allure.step("Open the drawer and mark it resolved"):
        risks_page.open_risk(risk_id)
        risks_page.resolve_from_drawer()

    with allure.step("Reopen the alert and verify it is now resolved"):
        risks_page.open_risk(risk_id)
        allure.attach(risks_page.drawer_status_text(), name="drawer-status-after-resolve")

    assert risks_page.drawer_status_text() == "resolved"
