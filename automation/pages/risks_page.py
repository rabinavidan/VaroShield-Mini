from playwright.sync_api import Page


class RisksPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

    def open(self) -> None:
        self.page.goto(f"{self.base_url}/risks")

    def risks_table_text(self) -> str:
        return self.page.text_content('[data-testid="risks-table"]') or ""

    def filter_by_severity(self, severity: str) -> None:
        self.page.select_option('[data-testid="severity-filter"]', severity)
