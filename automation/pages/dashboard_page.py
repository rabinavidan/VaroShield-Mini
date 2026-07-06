import allure
from playwright.sync_api import Page


class DashboardPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

    @allure.step("Open dashboard page")
    def open(self) -> None:
        self.page.goto(f"{self.base_url}/")

    @allure.step("Read total files stat")
    def total_files_text(self) -> str:
        return self.page.text_content('[data-testid="dashboard-total-files"]') or ""

    @allure.step("Read sensitive files stat")
    def sensitive_files_text(self) -> str:
        return self.page.text_content('[data-testid="dashboard-sensitive-files"]') or ""

    @allure.step("Read high risks stat")
    def high_risks_text(self) -> str:
        return self.page.text_content('[data-testid="dashboard-high-risks"]') or ""

    @allure.step("Click start scan button")
    def start_scan(self) -> None:
        self.page.click('[data-testid="start-scan-button"]')

    @allure.step("Read scan status text")
    def scan_status_text(self) -> str:
        return self.page.text_content('[data-testid="scan-status"]') or ""

    @allure.step("Wait for scan status to become done")
    def wait_for_scan_done(self, timeout: int = 60000) -> None:
        self.page.wait_for_selector(
            '[data-testid="scan-status"]:has-text("done")', timeout=timeout
        )
