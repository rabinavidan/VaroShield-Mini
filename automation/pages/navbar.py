import allure
from playwright.sync_api import Page


class Navbar:
    def __init__(self, page: Page):
        self.page = page

    @allure.step("Wait for the navbar to load")
    def wait_for_load(self) -> None:
        self.page.wait_for_selector('[data-testid="nav-logout"]')

    @allure.step("Go to Dashboard via navbar")
    def go_to_dashboard(self) -> None:
        self.page.click('[data-testid="nav-dashboard"]')

    @allure.step("Go to Files via navbar")
    def go_to_files(self) -> None:
        self.page.click('[data-testid="nav-files"]')

    @allure.step("Go to Risks via navbar")
    def go_to_risks(self) -> None:
        self.page.click('[data-testid="nav-risks"]')

    @allure.step("Log out via navbar")
    def logout(self) -> None:
        self.page.click('[data-testid="nav-logout"]')
