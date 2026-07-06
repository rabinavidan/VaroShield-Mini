import uuid


def unique_name(prefix: str = "file") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def sensitive_content() -> str:
    return "customer_email=jane.doe@example.com, credit_card=4111111111111111"


def non_sensitive_content() -> str:
    return "quarterly_report,revenue,120000,expenses,45000"
