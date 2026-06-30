import os, random, string
from datetime import datetime, timedelta

OTP_STORE = {}

def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def store_otp(email: str, otp: str, purpose: str = "login"):
    OTP_STORE[f"{email}:{purpose}"] = {
        "otp": otp,
        "expires": (datetime.utcnow() + timedelta(minutes=10)).isoformat(),
        "attempts": 0
    }

def verify_otp(email: str, otp: str, purpose: str = "login") -> bool:
    key = f"{email}:{purpose}"
    if key not in OTP_STORE: return False
    data = OTP_STORE[key]
    if datetime.utcnow() > datetime.fromisoformat(data["expires"]):
        del OTP_STORE[key]; return False
    data["attempts"] += 1
    if data["attempts"] > 3: del OTP_STORE[key]; return False
    if data["otp"] == otp: del OTP_STORE[key]; return True
    return False

def get_html(otp, purpose_text):
    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#0A1628;border-radius:16px;overflow:hidden;font-family:Arial,sans-serif;">
      <tr>
        <td style="background:linear-gradient(135deg,#4F8EF7,#7C3AED);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">ComplianceAI</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">Global AI Governance Platform</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;background:#112240;">
          <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Your verification code</h2>
          <p style="color:#94A3B8;font-size:14px;margin:0 0 24px;">Use this OTP to {purpose_text}. Expires in 10 minutes.</p>
          <div style="background:#0A1628;border:2px solid #4F8EF7;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <span style="font-size:40px;font-weight:700;letter-spacing:8px;color:#4F8EF7;font-family:monospace;">{otp}</span>
          </div>
          <p style="color:#475569;font-size:11px;text-align:center;margin:0;">
            If you did not request this, ignore this email.
            Copyright 2024 ComplianceAI
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>"""

def send_otp_email(email: str, otp: str, purpose: str = "login") -> bool:
    import httpx
    api_key = os.getenv("BREVO_API_KEY", "")
    print(f"[EMAIL DEBUG] Sending to {email}, BREVO_API_KEY exists: {bool(api_key)}")
    if not api_key:
        print(f"[DEV OTP] {email} => {otp}")
        return True
    purpose_text = "login" if purpose == "login" else ("create your account" if purpose == "register" else "reset your password")
    subject_map = {"login":"Your ComplianceAI Login Code","register":"Verify Your ComplianceAI Account","reset":"Reset Your ComplianceAI Password"}
    subject = subject_map.get(purpose, "Your ComplianceAI OTP Code")
    sender_email = os.getenv("SMTP_USER", "dhiman230703@gmail.com")
    try:
        payload = {
            "sender": {"name": "ComplianceAI", "email": sender_email},
            "to": [{"email": email}],
            "subject": subject,
            "htmlContent": get_html(otp, purpose_text)
        }
        response = httpx.post(
            "https://api.brevo.com/v3/smtp/email",
            json=payload,
            headers={"api-key": api_key, "Content-Type": "application/json"},
            timeout=30
        )
        print(f"[Brevo Response] Status: {response.status_code}")
        if response.status_code in [200, 201]:
            print(f"[EMAIL SENT] {email}")
            return True
        else:
            print(f"[EMAIL FAILED] {response.text}")
            print(f"[DEV OTP] {email} => {otp}")
            return False
    except Exception as e:
        print(f"[EMAIL EXCEPTION] {e}")
        print(f"[DEV OTP] {email} => {otp}")
        return False
