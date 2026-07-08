import allure
from playwright.sync_api import Page


class RisksPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

    @allure.step("Open risks page")
    def open(self) -> None:
        self.page.goto(f"{self.base_url}/risks")

    @allure.step("Wait for the risks page to load")
    def wait_for_load(self) -> None:
        self.page.wait_for_selector('[data-testid="risks-table"]')

    @allure.step("Read risks table text")
    def risks_table_text(self) -> str:
        return self.page.text_content('[data-testid="risks-table"]') or ""

    @allure.step("Find the risk row id for file {file_id}")
    def find_row_id(self, file_id: int) -> int:
        row = self.page.locator('[data-testid="risks-table"] tr', has_text=str(file_id)).first
        return int(row.get_attribute("data-testid").removeprefix("risk-row-"))

    @allure.step("Filter risks by severity {severity}")
    def filter_by_severity(self, severity: str) -> None:
        self.page.select_option('[data-testid="severity-filter"]', severity)

    @allure.step("Filter risks by status {status}")
    def filter_by_status(self, status: str) -> None:
        self.page.select_option('[data-testid="status-filter"]', status)

    @allure.step("Open the detail drawer for risk {risk_id}")
    def open_risk(self, risk_id: int) -> None:
        self.page.click(f'[data-testid="risk-row-{risk_id}"]')
        self.page.wait_for_selector('[data-testid="risk-drawer"]')

    @allure.step("Mark the open risk as resolved from the drawer")
    def resolve_from_drawer(self) -> None:
        self.page.click('[data-testid="risk-drawer-resolve"]')
        # Resolving closes the drawer and reloads the list.
        self.page.wait_for_selector('[data-testid="risk-drawer"]', state="detached")

    @allure.step("Read the risk status shown in the drawer")
    def drawer_status_text(self) -> str:
        return self.page.text_content('[data-testid="risk-drawer-status"]') or ""

    @allure.step("Close the risk detail drawer")
    def close_drawer(self) -> None:
        self.page.click('[data-testid="risk-drawer-close"]')

    @allure.step("Delete risk {risk_id} via its row action")
    def delete_risk(self, risk_id: int) -> None:
        self.page.click(f'[data-testid="risk-delete-{risk_id}"]')
        self.page.click('[data-testid="confirm-dialog-confirm"]')
