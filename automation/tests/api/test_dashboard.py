import allure
import pytest

from automation.utils.logger import logger
from automation.utils.test_data import sensitive_content, unique_name


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Dashboard summary updates after a scan")
@pytest.mark.api
@pytest.mark.smoke
def test_dashboard_summary_updated_after_scan(files_client, scan_client, dashboard_client):
    with allure.step("Read dashboard summary before change"):
        before = dashboard_client.get_summary()
        allure.attach(str(before), name="summary-before")

    with allure.step("Create a public sensitive file"):
        file_item = files_client.create_file(
            name=unique_name("dashboard-check"),
            content=sensitive_content(),
            owner="finance",
            is_public=True,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    with allure.step("Read dashboard summary after scan"):
        after = dashboard_client.get_summary()
        allure.attach(str(after), name="summary-after")

    assert after["total_files"] > before["total_files"]
    assert after["sensitive_files"] > before["sensitive_files"]
    assert after["high_risks"] > before["high_risks"]
    assert after["open_alerts"] > before["open_alerts"]
