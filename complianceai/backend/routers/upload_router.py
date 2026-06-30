from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import sys, os, io
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.database import get_db, User
from services.auth_service import get_current_user

upload_router = APIRouter(prefix="/upload", tags=["Upload"])

@upload_router.post("/analyze")
async def analyze_document(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    content = await file.read()
    text = ""
    filename = file.filename or ""
    try:
        if filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")
        elif filename.endswith(".pdf"):
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(content))
                text = " ".join(page.extract_text() or "" for page in reader.pages)
            except:
                text = content.decode("utf-8", errors="ignore")
        elif filename.endswith(".docx"):
            try:
                import docx
                doc = docx.Document(io.BytesIO(content))
                text = " ".join(p.text for p in doc.paragraphs)
            except:
                text = content.decode("utf-8", errors="ignore")
        else:
            text = content.decode("utf-8", errors="ignore")
    except:
        text = ""

    words = text.split()
    industry = "Other"
    data_types = []
    industry_keywords = {
        "Healthcare": ["health", "medical", "patient", "hospital", "diagnosis", "clinical"],
        "Finance and Banking": ["bank", "financial", "credit", "loan", "payment", "insurance"],
        "HR and Recruitment": ["hiring", "recruitment", "employee", "hr", "resume", "candidate"],
        "Education": ["student", "learning", "education", "school", "university", "course"],
        "E-Commerce": ["shop", "cart", "product", "order", "purchase", "retail"],
        "Law Enforcement": ["police", "surveillance", "criminal", "law", "enforcement"],
    }
    data_type_keywords = {
        "Personal Data": ["name", "email", "address", "phone", "personal"],
        "Biometric Data": ["biometric", "facial", "fingerprint", "iris", "voice"],
        "Health Records": ["health", "medical", "patient", "diagnosis"],
        "Financial Data": ["financial", "bank", "credit", "payment"],
        "Behavioral Data": ["behavior", "activity", "usage", "tracking"],
        "Children's Data": ["children", "minor", "student", "school"],
    }
    text_lower = text.lower()
    for ind, keywords in industry_keywords.items():
        if any(kw in text_lower for kw in keywords):
            industry = ind; break
    for dt, keywords in data_type_keywords.items():
        if any(kw in text_lower for kw in keywords):
            data_types.append(dt)
    if not data_types:
        data_types = ["Personal Data"]
    summary = " ".join(words[:100]) + "..." if len(words) > 100 else text[:500]
    return {
        "filename": filename,
        "file_size": len(content),
        "word_count": len(words),
        "suggested_system_name": filename.replace(".pdf","").replace(".docx","").replace(".txt","").replace("_"," ").title(),
        "suggested_industry": industry,
        "suggested_data_types": data_types[:3],
        "detected_topics": list(set(data_types)),
        "document_summary": summary,
        "text_preview": text[:500] if text else "Could not extract text"
    }
