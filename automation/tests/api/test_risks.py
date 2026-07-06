import allure
import pytest

from automation.utils.logger import logger
from automation.utils.test_data import (
    non_sensitive_content,
    sensitive_content,
    unique_name,
)


@allure.severity(allure.severity_level.BLOCKER)
@allure.title("Sensitive public file creates a HIGH risk alert")
@pytest.mark.api
@pytest.mark.risks
@pytest.mark.smoke
def test_sensitive_public_file_creates_high_risk(files_client, scan_client, risks_client):
    with allure.step("Create a public file with sensitive content"):
        file_item = files_client.create_file(
            name=unique_name("public-sensitive"),
            content=sensitive_content(),
            owner="finance",
            is_public=True,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    with allure.step("Fetch risk alerts for the file"):
        risks = risks_client.get_risks(file_id=file_item["id"])
        allure.attach(str(risks), name="risks")

    assert len(risks) == 1
    assert risks[0]["severity"] == "high"
    assert "publicly exposed" in risks[0]["reason"].lower()


@allure.severity(allure.severity_level.BLOCKER)
@allure.title("Sensitive file shared with everyone group creates a HIGH risk alert")
@pytest.mark.api
@pytest.mark.risks
def test_sensitive_file_shared_with_everyone_creates_high_risk(
    files_client, scan_client, risks_client
):
    with allure.step("Create a private file with sensitive content"):
        file_item = files_client.create_file(
            name=unique_name("everyone-sensitive"),
            content=sensitive_content(),
            owner="finance",
            is_public=False,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Share file with everyone group"):
        files_client.set_permission(file_item["id"], "everyone", "read")

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    with allure.step("Fetch risk alerts for the file"):
        risks = risks_client.get_risks(file_id=file_item["id"])
        allure.attach(str(risks), name="risks")

    assert len(risks) == 1
    assert risks[0]["severity"] == "high"
    assert "everyone" in risks[0]["reason"].lower()


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Private sensitive file does not create a HIGH risk alert")
@pytest.mark.api
@pytest.mark.risks
def test_private_sensitive_file_does_not_create_high_risk(
    files_client, scan_client, risks_client
):
    with allure.step("Create a private file with sensitive content, no sharing"):
        file_item = files_client.create_file(
            name=unique_name("private-sensitive"),
            content=sensitive_content(),
            owner="finance",
            is_public=False,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    with allure.step("Fetch risk alerts for the file"):
        risks = risks_client.get_risks(file_id=file_item["id"])
        allure.attach(str(risks), name="risks")

    assert len(risks) == 0


@allure.severity(allure.severity_level.NORMAL)
@allure.title("Non-sensitive public file creates a LOW risk alert")
@pytest.mark.api
@pytest.mark.risks
def test_non_sensitive_public_file_creates_low_risk(files_client, scan_client, risks_client):
    with allure.step("Create a public file with non-sensitive content"):
        file_item = files_client.create_file(
            name=unique_name("public-non-sensitive"),
            content=non_sensitive_content(),
            owner="engineering",
            is_public=True,
        )
        logger.info("Created file_id=%s", file_item["id"])

    with allure.step("Run scan and wait for completion"):
        scan_client.start_scan_and_wait()

    with allure.step("Fetch risk alerts for the file"):
        risks = risks_client.get_risks(file_id=file_item["id"])
        allure.attach(str(risks), name="risks")

    assert len(risks) == 1
    assert risks[0]["severity"] == "low"
