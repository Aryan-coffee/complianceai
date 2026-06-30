from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import sys, os, base64
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.database import get_db, User
from services.auth_service import get_current_user

documents_router = APIRouter(prefix="/documents", tags=["Documents"])

SAVED_DOCS = {}
SAVED_PDFS = {}

class SaveDocReq(BaseModel):
    filename: str
    file_size: int = 0
    word_count: int = 0
    suggested_system_name: str = ""
    suggested_industry: str = ""
    suggested_data_types: List[str] = []
    document_summary: str = ""

class SavePDFReq(BaseModel):
    check_id: str
    filename: str
    pdf_base64: str

@documents_router.post("/save")
def save_document(data: SaveDocReq, user: User = Depends(get_current_user)):
    user_id = str(user.id)
    if user_id not in SAVED_DOCS: SAVED_DOCS[user_id] = []
    doc = {"id": str(len(SAVED_DOCS[user_id])+1), "filename": data.filename, "file_size": data.file_size, "word_count": data.word_count, "suggested_system_name": data.suggested_system_name, "suggested_industry": data.suggested_industry, "suggested_data_types": data.suggested_data_types, "document_summary": data.document_summary, "created_at": datetime.utcnow().isoformat()}
    SAVED_DOCS[user_id].append(doc)
    return {"message": "Document saved!", "doc": doc}

@documents_router.get("/list")
def list_documents(user: User = Depends(get_current_user)):
    return {"documents": SAVED_DOCS.get(str(user.id), [])}

@documents_router.delete("/{doc_id}")
def delete_document(doc_id: str, user: User = Depends(get_current_user)):
    user_id = str(user.id)
    if user_id in SAVED_DOCS:
        SAVED_DOCS[user_id] = [d for d in SAVED_DOCS[user_id] if d["id"] != doc_id]
    return {"message": "Deleted!"}

@documents_router.post("/save-pdf")
def save_pdf(data: SavePDFReq, user: User = Depends(get_current_user)):
    user_id = str(user.id)
    if user_id not in SAVED_PDFS: SAVED_PDFS[user_id] = []
    pdf_entry = {"id": str(len(SAVED_PDFS[user_id])+1), "check_id": data.check_id, "filename": data.filename, "pdf_base64": data.pdf_base64, "created_at": datetime.utcnow().isoformat()}
    SAVED_PDFS[user_id].append(pdf_entry)
    return {"message": "PDF saved!", "pdf": {k: v for k, v in pdf_entry.items() if k != "pdf_base64"}}

@documents_router.get("/pdfs")
def list_pdfs(user: User = Depends(get_current_user)):
    pdfs = SAVED_PDFS.get(str(user.id), [])
    return {"pdfs": [{k: v for k, v in p.items() if k != "pdf_base64"} for p in pdfs]}

@documents_router.get("/pdfs/{pdf_id}/download")
def download_pdf(pdf_id: str, user: User = Depends(get_current_user)):
    pdfs = SAVED_PDFS.get(str(user.id), [])
    pdf = next((p for p in pdfs if p["id"] == pdf_id), None)
    if not pdf: raise HTTPException(status_code=404, detail="PDF not found")
    pdf_bytes = base64.b64decode(pdf["pdf_base64"])
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={pdf['filename']}"})
