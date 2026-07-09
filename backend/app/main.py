from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import seed_users
from app.database import Base, SessionLocal, engine
from app.routers import auth, dashboard, files, permissions, risks, scan

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DSPM Sentinel Mini")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(files.router)
app.include_router(permissions.router)
app.include_router(scan.router)
app.include_router(risks.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def on_startup() -> None:
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
