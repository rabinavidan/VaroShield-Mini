from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
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


@router.post("/{risk_id}/resolve", response_model=RiskAlertResponse)
def resolve_risk(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    risk = db.query(RiskAlert).filter(RiskAlert.id == risk_id).first()
    if not risk:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Risk alert not found"
        )

    risk.status = "resolved"
    db.commit()
    db.refresh(risk)
    return risk


@router.delete("/{risk_id}", status_code=http_status.HTTP_204_NO_CONTENT)
def delete_risk(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    risk = db.query(RiskAlert).filter(RiskAlert.id == risk_id).first()
    if not risk:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Risk alert not found"
        )
    db.delete(risk)
    db.commit()
