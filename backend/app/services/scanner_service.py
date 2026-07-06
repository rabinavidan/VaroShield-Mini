import asyncio
import re
import uuid
from datetime import datetime

from app.database import SessionLocal
from app.models import FileItem, ScanJob
from app.services.risk_service import evaluate_file_risk

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
CREDIT_CARD_PATTERN = re.compile(r"\b\d{13,19}\b")
PHONE_PATTERN = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")

SENSITIVE_KEYWORDS = ["password", "secret", "ssn", "credit_card", "email"]


def classify_content(content: str) -> str:
    if not content:
        return "safe"

    lowered = content.lower()

    if EMAIL_PATTERN.search(content):
        return "risky"
    if CREDIT_CARD_PATTERN.search(content):
        return "risky"
    if PHONE_PATTERN.search(content):
        return "risky"
    if any(keyword in lowered for keyword in SENSITIVE_KEYWORDS):
        return "risky"

    return "safe"


def new_job_id() -> str:
    return f"scan-{uuid.uuid4().hex[:8]}"


async def run_scan_job(job_id: str) -> None:
    db = SessionLocal()
    try:
        job = db.query(ScanJob).filter(ScanJob.job_id == job_id).first()
        if not job:
            return

        job.status = "running"
        db.commit()

        await asyncio.sleep(2)

        files = db.query(FileItem).all()
        sensitive_count = 0

        for file_item in files:
            file_item.classification = classify_content(file_item.content)
            if file_item.classification == "risky":
                sensitive_count += 1
            evaluate_file_risk(db, file_item)

        db.commit()

        job.status = "done"
        job.scanned_files = len(files)
        job.sensitive_files = sensitive_count
        job.finished_at = datetime.utcnow()
        db.commit()
    except Exception:
        job = db.query(ScanJob).filter(ScanJob.job_id == job_id).first()
        if job:
            job.status = "failed"
            job.finished_at = datetime.utcnow()
            db.commit()
        raise
    finally:
        db.close()
