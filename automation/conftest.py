import os

import pytest

from automation.clients.auth_client import AuthClient
from automation.clients.dashboard_client import DashboardClient
from automation.clients.files_client import FilesClient
from automation.clients.risks_client import RisksClient
from automation.clients.scan_client import ScanClient
from automation.utils.config import config


@pytest.fixture(scope="session")
def api_base_url() -> str:
    return config.api_base_url


@pytest.fixture(scope="session")
def ui_base_url() -> str:
    return config.ui_base_url


@pytest.fixture(scope="session")
def admin_token() -> str:
    return config.admin_token


@pytest.fixture(scope="session")
def user_token() -> str:
    return config.user_token


@pytest.fixture
def auth_client(api_base_url) -> AuthClient:
    return AuthClient(api_base_url)


@pytest.fixture
def files_client(api_base_url, admin_token) -> FilesClient:
    return FilesClient(api_base_url, token=admin_token)


@pytest.fixture
def user_files_client(api_base_url, user_token) -> FilesClient:
    return FilesClient(api_base_url, token=user_token)


@pytest.fixture
def scan_client(api_base_url, admin_token) -> ScanClient:
    return ScanClient(api_base_url, token=admin_token)


@pytest.fixture
def risks_client(api_base_url, admin_token) -> RisksClient:
    return RisksClient(api_base_url, token=admin_token)


@pytest.fixture
def dashboard_client(api_base_url, admin_token) -> DashboardClient:
    return DashboardClient(api_base_url, token=admin_token)


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    executable_path = os.getenv("PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH")
    if executable_path:
        return {**browser_type_launch_args, "executable_path": executable_path}
    return browser_type_launch_args


@pytest.fixture
def authenticated_page(page, ui_base_url, admin_token):
    page.goto(f"{ui_base_url}/login")
    page.evaluate(
        "(token) => localStorage.setItem('token', token)", admin_token
    )
    page.evaluate("() => localStorage.setItem('role', 'admin')")
    return page
