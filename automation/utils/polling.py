import time
from typing import Any, Callable

from automation.utils.logger import logger


def wait_until(
    action: Callable[[], Any],
    condition: Callable[[Any], bool],
    timeout: int = 60,
    interval: int = 2,
    error_message: str = "Condition was not met",
) -> Any:
    deadline = time.monotonic() + timeout
    last_result = None

    while time.monotonic() < deadline:
        last_result = action()
        if condition(last_result):
            return last_result

        logger.info("Polling... last result: %s", last_result)
        time.sleep(interval)

    raise TimeoutError(f"{error_message}. Last result: {last_result}")
