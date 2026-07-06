import os


class Config:
    api_base_url: str = os.getenv("API_BASE_URL", "http://localhost:8000")
    ui_base_url: str = os.getenv("UI_BASE_URL", "http://localhost:3000")

    admin_email: str = "admin@example.com"
    admin_password: str = "admin123"
    admin_token: str = "fake-admin-token"

    user_email: str = "user@example.com"
    user_password: str = "user123"
    user_token: str = "fake-user-token"


config = Config()
