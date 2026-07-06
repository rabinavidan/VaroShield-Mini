from sqlalchemy.orm import Session

from app.models import FileItem, RiskAlert

EVERYONE_GROUP = "everyone"
EVERYONE_ACCESS_LEVELS = {"read", "write", "admin"}


def _clear_open_alerts(db: Session, file_id: int) -> None:
    db.query(RiskAlert).filter(
        RiskAlert.file_id == file_id, RiskAlert.status == "open"
    ).delete()


def _is_shared_with_everyone(file_item: FileItem) -> bool:
    return any(
        permission.user_group == EVERYONE_GROUP
        and permission.access in EVERYONE_ACCESS_LEVELS
        for permission in file_item.permissions
    )


def evaluate_file_risk(db: Session, file_item: FileItem) -> RiskAlert | None:
    _clear_open_alerts(db, file_item.id)

    severity = None
    reason = None

    if file_item.classification == "sensitive" and file_item.is_public:
        severity = "high"
        reason = "Sensitive file is publicly exposed"
    elif file_item.classification == "sensitive" and _is_shared_with_everyone(file_item):
        severity = "high"
        reason = "Sensitive file is shared with everyone group"
    elif file_item.classification == "non_sensitive" and file_item.is_public:
        severity = "low"
        reason = "Non-sensitive public file"

    if not severity:
        return None

    alert = RiskAlert(
        file_id=file_item.id, severity=severity, reason=reason, status="open"
    )
    db.add(alert)
    return alert
