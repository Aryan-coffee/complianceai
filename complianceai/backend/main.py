from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from models.database import create_tables
from routers.api import auth_router, compliance_router, chat_router, payment_router, dashboard_router
from routers.otp_router import otp_router
from routers.upload_router import upload_router
from routers.documents_router import documents_router

app = FastAPI(title="ComplianceAI API", version="2.0", docs_url="/docs")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_router, prefix="/api/v1")
app.include_router(compliance_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(payment_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(otp_router, prefix="/api/v1")
app.include_router(upload_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")

@app.on_event("startup")
async def startup():
    print("ComplianceAI v2.0 starting...")
    create_tables()
    print("All database tables created successfully")
    print("Database ready!")

@app.get("/")
def root():
    return {"product": "ComplianceAI", "version": "2.0", "status": "running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
