from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./complianceai.db"
    SECRET_KEY: str = "complianceai-secret-key-2024-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    GROQ_API_KEY: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    RESEND_API_KEY: str = ""
    BREVO_API_KEY: str = ""
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_HOST: str = "smtp-relay.brevo.com"
    APP_NAME: str = "ComplianceAI"
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    FREE_CHECKS_PER_MONTH: int = 3
    STARTER_CHECKS_PER_MONTH: int = 20
    PRO_CHECKS_PER_MONTH: int = 999999

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
