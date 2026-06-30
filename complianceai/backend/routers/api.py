from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import sys, os, json, uuid
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.database import get_db, User, ComplianceCheck, ChatSession, ChatMessage, Payment
from services.auth_service import get_current_user, hash_password, verify_password, create_access_token, check_plan_limit, get_checks_remaining
from services.compliance_service import run_compliance_check
from services.chatbot_service import chat_with_gemini, get_quick_answers
from services.report_service import generate_pdf_report
from services.certificate_service import generate_certificate
from services.email_service import generate_otp, store_otp, verify_otp, send_otp_email

auth_router = APIRouter(prefix="/auth", tags=["Auth"])
compliance_router = APIRouter(prefix="/compliance", tags=["Compliance"])
chat_router = APIRouter(prefix="/chat", tags=["Chat"])
payment_router = APIRouter(prefix="/payments", tags=["Payments"])
dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# --- AUTH ---
class RegisterReq(BaseModel):
    email: str
    full_name: str
    password: str
    company_name: str = ""

class LoginReq(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    full_name: str = ""
    company_name: str = ""
    country: str = ""

@auth_router.post("/register")
def register(data: RegisterReq, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, full_name=data.full_name, company_name=data.company_name, hashed_password=hash_password(data.password), plan="free", is_active=True)
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "plan": user.plan}}

@auth_router.post("/login")
def login(data: LoginReq, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "company_name": user.company_name, "plan": user.plan}}

@auth_router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "company_name": user.company_name, "plan": user.plan, "country": getattr(user,"country","India"), "checks_used": user.checks_used_this_month}

@auth_router.put("/profile")
def update_profile(data: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.full_name: user.full_name = data.full_name
    if data.company_name: user.company_name = data.company_name
    if data.country:
        try: user.country = data.country
        except: pass
    db.commit(); db.refresh(user)
    return {"message": "Profile updated!", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "company_name": user.company_name, "plan": user.plan}}

# --- COMPLIANCE ---
class ComplianceCheckReq(BaseModel):
    ai_system_name: str
    ai_system_description: str
    industry: str
    data_types: List[str]
    selected_countries: List[str]
    deployment_regions: List[str] = []

class AuditReportReq(BaseModel):
    org_name: str
    industry: str = ""
    score: int
    answers: dict
    sections: List[dict]

@compliance_router.post("/check")
def compliance_check(data: ComplianceCheckReq, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not check_plan_limit(user, db):
        raise HTTPException(status_code=403, detail=f"Monthly check limit reached. Upgrade your plan.")
    results = run_compliance_check(data.ai_system_name, data.ai_system_description, data.industry, data.data_types, data.deployment_regions, data.selected_countries)
    check = ComplianceCheck(
        user_id=user.id, ai_system_name=data.ai_system_name, ai_system_description=data.ai_system_description,
        industry=data.industry, data_types=data.data_types, selected_countries=data.selected_countries,
        deployment_regions=data.deployment_regions, overall_score=results["overall_score"],
        status=results["overall_status"], overall_risk=results["overall_risk"],
        country_results=results["country_results"], critical_issues_count=results["critical_issues_count"],
        recommendations_count=results["recommendations_count"]
    )
    db.add(check)
    user.checks_used_this_month += 1
    db.commit(); db.refresh(check)
    return {"check_id": check.id, **results, "checks_remaining": get_checks_remaining(user)}

@compliance_router.get("/checks")
def list_checks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    checks = db.query(ComplianceCheck).filter(ComplianceCheck.user_id == user.id).order_by(ComplianceCheck.created_at.desc()).all()
    return [{"id": c.id, "ai_system_name": c.ai_system_name, "industry": c.industry, "overall_score": c.overall_score, "status": c.status, "overall_risk": c.overall_risk, "selected_countries": c.selected_countries, "critical_issues_count": c.critical_issues_count, "created_at": c.created_at} for c in checks]

@compliance_router.get("/checks/{check_id}")
def get_check(check_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id, ComplianceCheck.user_id == user.id).first()
    if not check: raise HTTPException(status_code=404, detail="Check not found")
    return {"id": check.id, "ai_system_name": check.ai_system_name, "industry": check.industry, "data_types": check.data_types, "selected_countries": check.selected_countries, "overall_score": check.overall_score, "status": check.status, "overall_risk": check.overall_risk, "country_results": check.country_results, "critical_issues_count": check.critical_issues_count, "created_at": check.created_at}

@compliance_router.get("/checks/{check_id}/pdf")
def download_pdf(check_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id, ComplianceCheck.user_id == user.id).first()
    if not check: raise HTTPException(status_code=404, detail="Check not found")
    check_data = {"ai_system_name": check.ai_system_name, "industry": check.industry, "selected_countries": check.selected_countries, "overall_score": check.overall_score, "overall_status": check.status, "overall_risk": check.overall_risk, "country_results": check.country_results or {}}
    user_data = {"full_name": user.full_name, "company_name": user.company_name, "email": user.email}
    pdf_bytes = generate_pdf_report(check_data, user_data)
    safe_name = check.ai_system_name.replace(" ", "_")
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=compliance_report_{safe_name}.pdf"})

@compliance_router.get("/checks/{check_id}/certificate")
def download_certificate(check_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from fastapi.responses import Response as FastAPIResponse
    check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id, ComplianceCheck.user_id == user.id).first()
    if not check: raise HTTPException(status_code=404, detail="Check not found")
    try:
        countries = check.selected_countries if isinstance(check.selected_countries, list) else json.loads(check.selected_countries or "[]")
    except: countries = ["Unknown"]
    pdf_bytes = generate_certificate(
        ai_system_name=check.ai_system_name or "AI System",
        company_name=user.company_name or user.full_name or "ComplianceAI",
        overall_score=int(check.overall_score or 0),
        overall_status=check.status or "Partially Compliant",
        countries=countries, check_id=check_id
    )
    safe_name = (check.ai_system_name or "AI").replace(" ", "_")
    return FastAPIResponse(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=certificate_{safe_name}.pdf"})

@compliance_router.post("/audit/report")
def download_audit_report(data: AuditReportReq, user: User = Depends(get_current_user)):
    try:
        from services.audit_report_service import generate_audit_report
        pdf_bytes = generate_audit_report(org_name=data.org_name, industry=data.industry, score=data.score, answers=data.answers, sections=data.sections)
        return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=AI_Audit_{data.org_name}.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- CHAT ---
class ChatReq(BaseModel):
    content: str
    session_id: Optional[str] = None
    check_id: Optional[str] = None

@chat_router.post("/message")
def chat_message(data: ChatReq, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = chat_with_gemini(data.content, data.session_id, user.id, data.check_id, db)
    return result

@chat_router.get("/sessions")
def get_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user.id).order_by(ChatSession.updated_at.desc()).all()
    result = []
    for s in sessions:
        count = db.query(ChatMessage).filter(ChatMessage.session_id == s.id).count()
        result.append({"id": s.id, "title": s.title, "message_count": count, "created_at": s.created_at, "updated_at": s.updated_at})
    return result

@chat_router.get("/sessions/{session_id}")
def get_session(session_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user.id).first()
    if not session: raise HTTPException(status_code=404, detail="Session not found")
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    return {"id": session.id, "title": session.title, "messages": [{"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]}

@chat_router.delete("/sessions/{session_id}")
def delete_session(session_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user.id).first()
    if not session: raise HTTPException(status_code=404, detail="Session not found")
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session); db.commit()
    return {"message": "Session deleted"}

@chat_router.get("/quick-questions")
def quick_questions():
    return get_quick_answers()

@chat_router.get("/usage")
def chat_usage(user: User = Depends(get_current_user)):
    return {"messages_used": 0, "messages_limit": 100, "messages_remaining": 100, "plan": user.plan}

# --- PAYMENTS ---
class OrderReq(BaseModel):
    plan: str

@payment_router.post("/create-order")
def create_order(data: OrderReq, user: User = Depends(get_current_user)):
    prices = {"starter": 99900, "pro": 299900}
    amount = prices.get(data.plan, 99900)
    try:
        import razorpay
        from core.config import settings
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order = client.order.create({"amount": amount, "currency": "INR", "receipt": f"order_{user.id[:8]}"})
        return {"order_id": order["id"], "amount": amount, "currency": "INR", "key_id": settings.RAZORPAY_KEY_ID, "plan": data.plan}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment failed: {str(e)}")

@payment_router.post("/verify")
def verify_payment(request: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = request.get("plan", "starter")
    user.plan = plan; db.commit()
    return {"message": f"Upgraded to {plan}!", "plan": plan}

@payment_router.get("/history")
def payment_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(Payment.user_id == user.id).order_by(Payment.created_at.desc()).all()
    return [{"id": p.id, "amount": p.amount, "currency": p.currency, "plan": p.plan, "status": p.status, "created_at": p.created_at} for p in payments]

# --- DASHBOARD ---
@dashboard_router.get("/stats")
def get_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from collections import Counter
    checks = db.query(ComplianceCheck).filter(ComplianceCheck.user_id == user.id).order_by(ComplianceCheck.created_at.desc()).all()
    compliant = sum(1 for c in checks if c.status == "Compliant")
    partial = sum(1 for c in checks if c.status == "Partially Compliant")
    non_compliant = sum(1 for c in checks if c.status == "Non-Compliant")
    avg_score = round(sum(c.overall_score or 0 for c in checks) / len(checks)) if checks else 0
    country_counter = Counter()
    for c in checks:
        countries = c.selected_countries if isinstance(c.selected_countries, list) else []
        for country in countries: country_counter[country] += 1
    return {
        "total_checks": len(checks),
        "avg_score": avg_score,
        "compliant_count": compliant,
        "partial_count": partial,
        "non_compliant_count": non_compliant,
        "checks_remaining": get_checks_remaining(user),
        "checks_used": user.checks_used_this_month,
        "plan": user.plan,
        "country_stats": dict(country_counter.most_common(5)),
        "recent_checks": [{"id": c.id, "ai_system_name": c.ai_system_name, "overall_score": c.overall_score, "status": c.status, "selected_countries": c.selected_countries, "created_at": c.created_at} for c in checks[:5]]
    }

@dashboard_router.get("/analytics")
def get_analytics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from collections import Counter
    checks = db.query(ComplianceCheck).filter(ComplianceCheck.user_id == user.id).all()
    country_counts = Counter()
    monthly_counts = Counter()
    for c in checks:
        countries = c.selected_countries if isinstance(c.selected_countries, list) else []
        for country in countries: country_counts[country] += 1
        month = c.created_at.strftime("%b %Y") if c.created_at else "Unknown"
        monthly_counts[month] += 1
    return {
        "total_checks": len(checks),
        "country_breakdown": dict(country_counts.most_common(10)),
        "monthly_trend": dict(monthly_counts),
        "avg_score": round(sum(c.overall_score or 0 for c in checks) / len(checks)) if checks else 0,
        "status_breakdown": {"compliant": sum(1 for c in checks if c.status=="Compliant"), "partial": sum(1 for c in checks if c.status=="Partially Compliant"), "non_compliant": sum(1 for c in checks if c.status=="Non-Compliant")},
        "top_industries": dict(Counter(c.industry for c in checks if c.industry).most_common(5)),
    }

@dashboard_router.get("/countries-coverage")
def countries_coverage():
    return {"countries": ["EU","India","USA","UK","Canada","Singapore","Australia","Brazil","China","Japan"], "count": 10}
