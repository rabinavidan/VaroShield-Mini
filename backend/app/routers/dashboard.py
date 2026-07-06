from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import FileItem, RiskAlert, User
from app.schemas import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    total_files = db.query(FileItem).count()
    sensitive_files = (
        db.query(FileItem).filter(FileItem.classification == "risky").count()
    )
    public_files = db.query(FileItem).filter(FileItem.is_public.is_(True)).count()
    high_risks = (
        db.query(RiskAlert)
        .filter(RiskAlert.severity == "high", RiskAlert.status == "open")
        .count()
    )
    open_alerts = db.query(RiskAlert).filter(RiskAlert.status == "open").count()

    return DashboardSummary(
        total_files=total_files,
        sensitive_files=sensitive_files,
        public_files=public_files,
        high_risks=high_risks,
        open_alerts=open_alerts,
    )
