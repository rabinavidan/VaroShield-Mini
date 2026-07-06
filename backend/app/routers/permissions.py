from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import FileItem, Permission, User
from app.schemas import PermissionCreateRequest, PermissionResponse

router = APIRouter(prefix="/files", tags=["permissions"])


@router.post("/{file_id}/permissions", response_model=PermissionResponse)
def set_permission(
    file_id: int,
    payload: PermissionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    file_item = db.query(FileItem).filter(FileItem.id == file_id).first()
    if not file_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
        )

    permission = (
        db.query(Permission)
        .filter(Permission.file_id == file_id, Permission.user_group == payload.user_group)
        .first()
    )
    if permission:
        permission.access = payload.access
    else:
        permission = Permission(
            file_id=file_id, user_group=payload.user_group, access=payload.access
        )
        db.add(permission)

    db.commit()
    db.refresh(permission)
    return permission
