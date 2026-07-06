from playwright.sync_api import Page


class DashboardPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

    def open(self) -> None:
        self.page.goto(f"{self.base_url}/")

    def total_files_text(self) -> str:
        return self.page.text_content('[data-testid="dashboard-total-files"]') or ""

    def sensitive_files_text(self) -> str:
        return self.page.text_content('[data-testid="dashboard-sensitive-files"]') or ""

    def high_risks_text(self) -> str:
        return self.page.text_content('[data-testid="dashboard-high-risks"]') or ""

    def start_scan(self) -> None:
        self.page.click('[data-testid="start-scan-button"]')

    def scan_status_text(self) -> str:
        return self.page.text_content('[data-testid="scan-status"]') or ""

    def wait_for_scan_done(self, timeout: int = 60000) -> None:
        self.page.wait_for_selector(
            '[data-testid="scan-status"]:has-text("done")', timeout=timeout
        )
