from playwright.sync_api import Page


class LoginPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url

    def open(self) -> None:
        self.page.goto(f"{self.base_url}/login")

    def login(self, email: str, password: str) -> None:
        self.page.fill('[data-testid="login-email"]', email)
        self.page.fill('[data-testid="login-password"]', password)
        self.page.click('[data-testid="login-submit"]')
