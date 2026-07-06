from sqlalchemy.orm import Session

from app.models import FileItem, RiskAlert


def _clear_open_alerts(db: Session, file_id: int) -> None:
    db.query(RiskAlert).filter(
        RiskAlert.file_id == file_id, RiskAlert.status == "open"
    ).delete()


def evaluate_file_risk(db: Session, file_item: FileItem) -> RiskAlert | None:
    _clear_open_alerts(db, file_item.id)

    severity = None
    reason = None

    if file_item.classification == "risky" and file_item.is_public:
        severity = "high"
        reason = "Sensitive file is publicly exposed"
    elif file_item.classification == "risky" and file_item.is_shared_with_everyone:
        severity = "high"
        reason = "Sensitive file is shared with everyone group"
    elif file_item.classification == "safe" and file_item.is_public:
        severity = "low"
        reason = "Non-sensitive public file"

    if not severity:
        return None

    alert = RiskAlert(
        file_id=file_item.id, severity=severity, reason=reason, status="open"
    )
    db.add(alert)
    return alert
