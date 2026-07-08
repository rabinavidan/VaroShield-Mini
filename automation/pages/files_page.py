import allure
from playwright.sync_api import Page


class FilesPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

    @allure.step("Open files page")
    def open(self) -> None:
        self.page.goto(f"{self.base_url}/files")

    @allure.step("Wait for the files page to load")
    def wait_for_load(self) -> None:
        self.page.wait_for_selector('[data-testid="files-table"]')

    @allure.step("Create file {name} via UI form")
    def create_file(self, name: str, content: str, owner: str, is_public: bool = False) -> None:
        self.page.fill('[data-testid="create-file-name"]', name)
        self.page.fill('[data-testid="create-file-content"]', content)
        self.page.fill('[data-testid="create-file-owner"]', owner)
        if is_public:
            self.page.check('[data-testid="create-file-public"]')
        self.page.click('[data-testid="create-file-submit"]')
        self.page.wait_for_selector(f"text={name}")

    @allure.step("Read files table text")
    def files_table_text(self) -> str:
        return self.page.text_content('[data-testid="files-table"]') or ""

    @allure.step("Find the row id for the file named {name}")
    def find_row_id(self, name: str) -> int:
        row = self.page.locator('[data-testid="files-table"] tr', has_text=name).first
        return int(row.get_attribute("data-testid").removeprefix("file-row-"))

    @allure.step("Wait for file row {file_id} to be removed")
    def wait_for_row_removed(self, file_id: int) -> None:
        self.page.wait_for_selector(f'[data-testid="file-row-{file_id}"]', state="detached")

    @allure.step("Delete file {file_id} via its row action")
    def delete_file(self, file_id: int) -> None:
        self.page.click(f'[data-testid="file-delete-{file_id}"]')
        self.page.click('[data-testid="confirm-dialog-confirm"]')
        self.wait_for_row_removed(file_id)

    @allure.step("Expose file {file_id} to everyone via its row action")
    def expose_file(self, file_id: int) -> None:
        self.page.click(f'[data-testid="file-expose-{file_id}"]')
