from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    role: str


class FileCreateRequest(BaseModel):
    name: str
    content: str = ""
    owner: str
    is_public: bool = False


class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    owner: str
    classification: str
    is_public: bool
    created_at: datetime


class PermissionCreateRequest(BaseModel):
    user_group: str
    access: str = "read"


class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    file_id: int
    user_group: str
    access: str


class ScanStartResponse(BaseModel):
    job_id: str
    status: str


class ScanSummary(BaseModel):
    scanned_files: int
    sensitive_files: int


class ScanStatusResponse(BaseModel):
    job_id: str
    status: str
    summary: Optional[ScanSummary] = None


class RiskAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    file_id: int
    severity: str
    reason: str
    status: str
    created_at: datetime


class DashboardSummary(BaseModel):
    total_files: int
    sensitive_files: int
    public_files: int
    high_risks: int
    open_alerts: int
