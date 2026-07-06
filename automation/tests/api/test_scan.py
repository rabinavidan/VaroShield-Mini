import allure
import pytest

from automation.utils.logger import logger
from automation.utils.test_data import (
    non_sensitive_content,
    sensitive_content,
    unique_name,
)


@allure.severity(allure.severity_level.BLOCKER)
@allure.title("Scan job reaches done status")
@pytest.mark.api
@pytest.mark.scan
@pytest.mark.smoke
def test_scan_job_reaches_done_status(scan_client):
    with allure.step("Start scan and poll until done"):
        result = scan_client.start_scan_and_wait()
        logger.info("Scan finished with status=%s", result["status"])
        allure.attach(str(result), name="scan-result")

    assert result["status"] == "done"
    assert "summary" in result


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Sensitive file is classified as sensitive after scan")
@pytest.mark.api
@pytest.mark.scan
def test_sensitive_file_classification_after_scan(files_client, scan_client):
    with allure.step("Create a file with sensitive content"):
        file_item = files_client.create_file(
            name=unique_name("sensitive"),
            content=sensitive_content(),
            owner="finance",
            is_public=False,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    with allure.step("Fetch file after scan"):
        scanned_file = files_client.get_file(file_item["id"])
        allure.attach(str(scanned_file), name="scanned-file")

    assert scanned_file["classification"] == "sensitive"


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Non-sensitive file is classified as non_sensitive after scan")
@pytest.mark.api
@pytest.mark.scan
def test_non_sensitive_file_classification_after_scan(files_client, scan_client):
    with allure.step("Create a file with non-sensitive content"):
        file_item = files_client.create_file(
            name=unique_name("non-sensitive"),
            content=non_sensitive_content(),
            owner="engineering",
            is_public=False,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    with allure.step("Fetch file after scan"):
        scanned_file = files_client.get_file(file_item["id"])
        allure.attach(str(scanned_file), name="scanned-file")

    assert scanned_file["classification"] == "non_sensitive"
