from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.database import get_db, User
from services.email_service import generate_otp, store_otp, verify_otp, send_otp_email
from services.auth_service import hash_password, create_access_token

otp_router = APIRouter(prefix="/otp", tags=["OTP"])

class OTPSendReq(BaseModel):
    email: str
    purpose: str = "login"

class OTPVerifyReq(BaseModel):
    email: str
    otp: str
    purpose: str = "login"

class OTPRegisterReq(BaseModel):
    email: str
    otp: str
    full_name: str
    company_name: str = ""
    country: str = "India"
    password: str = "otp_user_2024"

class OTPResetReq(BaseModel):
    email: str
    otp: str
    new_password: str

@otp_router.post("/send")
def send_otp(data: OTPSendReq, db: Session = Depends(get_db)):
    if data.purpose == "login":
        user = db.query(User).filter(User.email == data.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Email not registered. Please create an account.")
    otp = generate_otp()
    store_otp(data.email, otp, data.purpose)
    send_otp_email(data.email, otp, data.purpose)
    return {"message": f"OTP sent to {data.email}"}

@otp_router.post("/verify-login")
def verify_login(data: OTPVerifyReq, db: Session = Depends(get_db)):
    if not verify_otp(data.email, data.otp, data.purpose):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "company_name": user.company_name, "plan": user.plan, "country": getattr(user, "country", "India")}}

@otp_router.post("/register")
def register_with_otp(data: OTPRegisterReq, db: Session = Depends(get_db)):
    if not verify_otp(data.email, data.otp, "register"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        full_name=data.full_name,
        company_name=data.company_name or "",
        hashed_password=hash_password(data.password),
        plan="free",
        is_active=True,
        is_email_verified=True
    )
    try:
        user.country = data.country
    except:
        pass
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "company_name": user.company_name, "plan": user.plan}}

@otp_router.post("/reset-password")
def reset_password(data: OTPResetReq, db: Session = Depends(get_db)):
    if not verify_otp(data.email, data.otp, "reset"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successful"}
