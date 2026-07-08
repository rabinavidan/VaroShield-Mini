import allure
from playwright.sync_api import Page


class LoginPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

    @allure.step("Open login page")
    def open(self) -> None:
        self.page.goto(f"{self.base_url}/login")

    @allure.step("Login with email {email}")
    def login(self, email: str, password: str) -> None:
        self.page.fill('[data-testid="login-email"]', email)
        self.page.fill('[data-testid="login-password"]', password)
        self.page.click('[data-testid="login-submit"]')

    @allure.step("Wait for the login page to load")
    def wait_for_load(self) -> None:
        self.page.wait_for_selector('[data-testid="login-submit"]')
