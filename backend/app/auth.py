from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

TOKEN_PREFIX = "fake-"
TOKEN_SUFFIX = "-token"

SEED_USERS = [
    {"email": "admin@example.com", "password": "admin123", "role": "admin"},
    {"email": "user@example.com", "password": "user123", "role": "user"},
]


def seed_users(db: Session) -> None:
    for seed in SEED_USERS:
        existing = db.query(User).filter(User.email == seed["email"]).first()
        if not existing:
            db.add(User(**seed))
    db.commit()


def make_token(role: str) -> str:
    return f"{TOKEN_PREFIX}{role}{TOKEN_SUFFIX}"


def role_from_token(token: str) -> str:
    if not token.startswith(TOKEN_PREFIX) or not token.endswith(TOKEN_SUFFIX):
        return ""
    return token[len(TOKEN_PREFIX) : -len(TOKEN_SUFFIX)]


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token"
        )

    token = auth_header.removeprefix("Bearer ").strip()
    role = role_from_token(token)
    if role not in ("admin", "user"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    user = db.query(User).filter(User.role == role).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required"
        )
    return current_user
