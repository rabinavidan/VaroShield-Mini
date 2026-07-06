from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.constants import EVERYONE_ACCESS_LEVELS, EVERYONE_GROUP
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")


class FileItem(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    content = Column(String, nullable=False, default="")
    owner = Column(String, nullable=False)
    classification = Column(String, nullable=False, default="unknown")
    source = Column(String, nullable=False, default="other")
    is_public = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    permissions = relationship(
        "Permission", back_populates="file", cascade="all, delete-orphan"
    )
    risk_alerts = relationship(
        "RiskAlert", back_populates="file", cascade="all, delete-orphan"
    )

    @property
    def is_shared_with_everyone(self) -> bool:
        return any(
            p.user_group == EVERYONE_GROUP and p.access in EVERYONE_ACCESS_LEVELS
            for p in self.permissions
        )


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    user_group = Column(String, nullable=False)
    access = Column(String, nullable=False, default="none")

    file = relationship("FileItem", back_populates="permissions")


class ScanJob(Base):
    __tablename__ = "scan_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, nullable=False, default="pending")
    scanned_files = Column(Integer, nullable=False, default=0)
    sensitive_files = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    severity = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, nullable=False, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("FileItem", back_populates="risk_alerts")
