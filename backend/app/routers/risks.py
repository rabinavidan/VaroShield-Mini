from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import RiskAlert, User
from app.schemas import RiskAlertResponse

router = APIRouter(prefix="/risks", tags=["risks"])


@router.get("", response_model=list[RiskAlertResponse])
def list_risks(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    file_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(RiskAlert)
    if severity:
        query = query.filter(RiskAlert.severity == severity)
    if status:
        query = query.filter(RiskAlert.status == status)
    if file_id:
        query = query.filter(RiskAlert.file_id == file_id)

    return query.order_by(RiskAlert.id).all()
