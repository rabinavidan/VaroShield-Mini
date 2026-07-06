from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models import FileItem, User
from app.schemas import FileCreateRequest, FileResponse

router = APIRouter(prefix="/files", tags=["files"])


@router.get("", response_model=list[FileResponse])
def list_files(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(FileItem).order_by(FileItem.id).all()


@router.post("", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
def create_file(
    payload: FileCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    file_item = FileItem(
        name=payload.name,
        content=payload.content,
        owner=payload.owner,
        is_public=payload.is_public,
        classification="unknown",
    )
    db.add(file_item)
    db.commit()
    db.refresh(file_item)
    return file_item


@router.get("/{file_id}", response_model=FileResponse)
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file_item = db.query(FileItem).filter(FileItem.id == file_id).first()
    if not file_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
        )
    return file_item
