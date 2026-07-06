import asyncio

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models import ScanJob, User
from app.schemas import ScanStartResponse, ScanStatusResponse, ScanSummary
from app.services.scanner_service import new_job_id, run_scan_job

router = APIRouter(prefix="/scan", tags=["scan"])


@router.post("/start", response_model=ScanStartResponse)
async def start_scan(
    db: Session = Depends(get_db), current_user: User = Depends(require_admin)
):
    job = ScanJob(job_id=new_job_id(), status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)

    asyncio.create_task(run_scan_job(job.job_id))

    return ScanStartResponse(job_id=job.job_id, status=job.status)


@router.get("/{job_id}", response_model=ScanStatusResponse)
def get_scan_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(ScanJob).filter(ScanJob.job_id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scan job not found"
        )

    summary = None
    if job.status == "done":
        summary = ScanSummary(
            scanned_files=job.scanned_files, sensitive_files=job.sensitive_files
        )

    return ScanStatusResponse(job_id=job.job_id, status=job.status, summary=summary)
