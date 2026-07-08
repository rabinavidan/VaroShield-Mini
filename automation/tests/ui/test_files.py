import allure
import pytest

from automation.pages.files_page import FilesPage
from automation.utils.logger import logger
from automation.utils.test_data import safe_content, unique_name


@allure.severity(allure.severity_level.CRITICAL)
@allure.title("Admin can create and delete a file through the UI")
@pytest.mark.ui
@pytest.mark.smoke
def test_admin_can_create_and_delete_file(authenticated_page, ui_base_url):
    files_page = FilesPage(authenticated_page, ui_base_url)
    name = unique_name("ui-file")

    with allure.step("Open files page and create a file via the form"):
        files_page.open()
        files_page.create_file(name=name, content=safe_content(), owner="qa-team")
        allure.attach(files_page.files_table_text(), name="files-table-after-create")

    assert name in files_page.files_table_text()

    with allure.step("Find the created file's row id and delete it"):
        file_id = files_page.find_row_id(name)
        logger.info("Created file_id=%s via UI", file_id)
        files_page.delete_file(file_id)

    assert name not in files_page.files_table_text()
