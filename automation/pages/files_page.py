import allure
from playwright.sync_api import Page


class FilesPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

    @allure.step("Open files page")
    def open(self) -> None:
        self.page.goto(f"{self.base_url}/files")

    @allure.step("Create file {name} via UI form")
    def create_file(self, name: str, content: str, owner: str, is_public: bool = False) -> None:
        self.page.fill('[data-testid="create-file-name"]', name)
        self.page.fill('[data-testid="create-file-content"]', content)
        self.page.fill('[data-testid="create-file-owner"]', owner)
        if is_public:
            self.page.check('[data-testid="create-file-public"]')
        self.page.click('[data-testid="create-file-submit"]')

    @allure.step("Read files table text")
    def files_table_text(self) -> str:
        return self.page.text_content('[data-testid="files-table"]') or ""
