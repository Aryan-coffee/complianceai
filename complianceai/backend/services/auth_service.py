from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.database import get_db, User
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def check_plan_limit(user: User, db: Session) -> bool:
    # Admin email - unlimited access
    if user.email == "dhimanaryan371@gmail.com":
        return True
    now = datetime.utcnow()
    if not user.checks_reset_date or user.checks_reset_date.month != now.month:
        user.checks_used_this_month = 0
        user.checks_reset_date = now
        db.commit()
    limits = {"free": settings.FREE_CHECKS_PER_MONTH, "starter": settings.STARTER_CHECKS_PER_MONTH, "pro": settings.PRO_CHECKS_PER_MONTH, "enterprise": 999999}
    return user.checks_used_this_month < limits.get(user.plan, 3)

def get_checks_remaining(user: User) -> int:
    if user.email == "dhimanaryan371@gmail.com":
        return 999999
    limits = {"free": settings.FREE_CHECKS_PER_MONTH, "starter": settings.STARTER_CHECKS_PER_MONTH, "pro": settings.PRO_CHECKS_PER_MONTH, "enterprise": 999999}
    return max(0, limits.get(user.plan, 3) - user.checks_used_this_month)
