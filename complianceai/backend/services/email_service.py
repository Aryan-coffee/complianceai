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
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
  <tr><td align="center">
    <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr>
        <td style="background:#1a2744;padding:28px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">ComplianceAI</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;background:#ffffff;">
          <p style="color:#1e293b;font-size:15px;margin:0 0 16px;">Hello,</p>
          <p style="color:#475569;font-size:14px;margin:0 0 24px;line-height:1.6;">Please use the verification code below to {purpose_text} on ComplianceAI.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
              <span style="font-size:32px;font-weight:700;letter-spacing:6px;color:#1a2744;font-family:monospace;">{otp}</span>
            </td></tr>
          </table>
          <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;text-align:center;">This code will expire in 10 minutes.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
          <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">If you did not request this code, you can safely ignore this email.</p>
          <p style="color:#cbd5e1;font-size:10px;margin:16px 0 0;text-align:center;">ComplianceAI, Noida, Uttar Pradesh, India</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>"""


def _send_via_sendgrid(email, otp, purpose):
    try:
        import httpx
        api_key = os.getenv("SENDGRID_API_KEY", "")
        if not api_key:
            return False
        purpose_text = "login" if purpose == "login" else ("create your account" if purpose == "register" else "reset your password")
        subject_map = {"login":"Your ComplianceAI verification code","register":"Confirm your ComplianceAI account","reset":"ComplianceAI password reset request"}
        subject = subject_map.get(purpose, "Your ComplianceAI OTP Code")
        sender_email = os.getenv("SMTP_USER", "dhiman230703@gmail.com")
        payload = {
            "personalizations": [{"to": [{"email": email}]}],
            "from": {"email": sender_email, "name": "ComplianceAI"},
            "subject": subject,
            "content": [{"type": "text/html", "value": get_html(otp, purpose_text)}]
        }
        response = httpx.post(
            "https://api.sendgrid.com/v3/mail/send",
            json=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            timeout=30
        )
        print(f"[SendGrid Response] Status: {response.status_code}")
        if response.status_code in [200, 201, 202]:
            print(f"[EMAIL SENT via SendGrid] {email}")
            return True
        else:
            print(f"[SendGrid ERROR] {response.text}")
            return False
    except Exception as e:
        print(f"[SendGrid EXCEPTION] {e}")
        return False

def send_otp_email(email: str, otp: str, purpose: str = "login") -> bool:
    if _send_via_sendgrid(email, otp, purpose):
        return True
    import httpx
    api_key = os.getenv("BREVO_API_KEY", "")
    print(f"[EMAIL DEBUG] Sending to {email}, BREVO_API_KEY exists: {bool(api_key)}")
    if not api_key:
        print(f"[DEV OTP] {email} => {otp}")
        return True
    purpose_text = "login" if purpose == "login" else ("create your account" if purpose == "register" else "reset your password")
    subject_map = {"login":"Your ComplianceAI verification code","register":"Confirm your ComplianceAI account","reset":"ComplianceAI password reset request"}
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
