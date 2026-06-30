from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid, os, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    company_name = Column(String, default="")
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    country = Column(String, default="India")
    plan = Column(String, default="free")
    checks_used_this_month = Column(Integer, default=0)
    checks_reset_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    ai_system_name = Column(String, nullable=False)
    ai_system_description = Column(Text)
    industry = Column(String)
    data_types = Column(JSON)
    selected_countries = Column(JSON)
    deployment_regions = Column(JSON)
    overall_score = Column(Integer)
    status = Column(String)
    overall_risk = Column(String)
    country_results = Column(JSON)
    critical_issues_count = Column(Integer, default=0)
    recommendations_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    check_id = Column(String, nullable=True)
    title = Column(String, default="New conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    amount = Column(Float)
    currency = Column(String, default="INR")
    plan = Column(String)
    status = Column(String, default="pending")
    razorpay_order_id = Column(String)
    razorpay_payment_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("All database tables created successfully")
