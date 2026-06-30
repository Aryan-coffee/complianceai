import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.config import settings
from models.database import ChatSession, ChatMessage, ComplianceCheck
from groq import Groq

SYSTEM_PROMPT = """You are ComplianceAI Assistant, an expert AI governance advisor. You ONLY answer questions related to:
- AI compliance regulations (EU AI Act, GDPR, India DPDP Act, NIST AI RMF, UK AI Framework, etc.)
- AI governance, auditing, risk assessment
- Data privacy laws and requirements
- AI ethics and best practices
- Compliance checklists and remediation

If asked about anything else, politely redirect to compliance topics.
Always cite specific regulations and provide actionable advice."""

def get_groq_client():
    return Groq(api_key=settings.GROQ_API_KEY)

def get_or_create_session(db, user_id, session_id=None, check_id=None):
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
        if session:
            return session
    title = "New conversation"
    if check_id:
        check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id, ComplianceCheck.user_id == user_id).first()
        if check:
            title = f"Compliance: {check.ai_system_name}"
    session = ChatSession(user_id=user_id, check_id=check_id, title=title)
    db.add(session); db.commit(); db.refresh(session)
    return session

def chat_with_gemini(user_message, session_id, user_id, check_id=None, db=None):
    client = get_groq_client()
    session = get_or_create_session(db, user_id, session_id, check_id)
    history = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at).all()

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history[-20:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
        max_tokens=1500
    )
    assistant_reply = response.choices[0].message.content

    if not history:
        session.title = user_message[:60] + ("..." if len(user_message) > 60 else "")
        db.commit()

    db.add(ChatMessage(session_id=session.id, role="user", content=user_message))
    assistant_msg = ChatMessage(session_id=session.id, role="assistant", content=assistant_reply)
    db.add(assistant_msg); db.commit(); db.refresh(assistant_msg)

    return {
        "session_id": session.id,
        "session_title": session.title,
        "message": {
            "id": assistant_msg.id,
            "role": "assistant",
            "content": assistant_reply,
            "created_at": assistant_msg.created_at
        }
    }

def get_quick_answers():
    return [
        "What makes an AI system high-risk under the EU AI Act?",
        "How do I make my hiring AI compliant in India?",
        "What are penalties for GDPR violations?",
        "Does my chatbot need to disclose it is an AI?"
    ]
