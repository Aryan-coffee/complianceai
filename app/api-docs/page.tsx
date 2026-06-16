
"use client"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"

const ENDPOINTS = [
  {
    method:"POST", path:"/api/v1/compliance/check", tag:"Compliance",
    desc:"Run AI compliance check against selected countries",
    body:`{
  "ai_system_name": "HireVision AI",
  "ai_system_description": "Facial recognition hiring tool",
  "industry": "HR and Recruitment",
  "data_types": ["Biometric Data", "Personal Data"],
  "selected_countries": ["EU", "India"],
  "deployment_regions": ["EU", "India"]
}`,
    response:`{
  "check_id": "uuid",
  "overall_score": 35,
  "overall_status": "Non-Compliant",
  "overall_risk": "High",
  "country_results": { ... },
  "critical_issues_count": 8
}`
  },
  {
    method:"GET", path:"/api/v1/compliance/checks", tag:"Compliance",
    desc:"Get all compliance checks for authenticated user",
    body:null,
    response:`[{ "id": "uuid", "ai_system_name": "...", "overall_score": 75, "status": "Compliant" }]`
  },
  {
    method:"GET", path:"/api/v1/compliance/checks/{id}/pdf", tag:"Compliance",
    desc:"Download PDF report for a compliance check",
    body:null,
    response:"PDF file (application/pdf)"
  },
  {
    method:"POST", path:"/api/v1/otp/send", tag:"Auth",
    desc:"Send OTP to email for login or registration",
    body:`{ "email": "user@example.com", "purpose": "login" }`,
    response:`{ "message": "OTP sent to email" }`
  },
  {
    method:"POST", path:"/api/v1/otp/verify-login", tag:"Auth",
    desc:"Verify OTP and get access token",
    body:`{ "email": "user@example.com", "otp": "123456", "purpose": "login" }`,
    response:`{ "access_token": "jwt_token", "token_type": "bearer", "user": { ... } }`
  },
  {
    method:"POST", path:"/api/v1/otp/register", tag:"Auth",
    desc:"Register new user with OTP verification",
    body:`{ "email": "user@example.com", "otp": "123456", "full_name": "John Smith", "country": "India", "password": "min8chars" }`,
    response:`{ "access_token": "jwt_token", "user": { ... } }`
  },
  {
    method:"POST", path:"/api/v1/upload/analyze", tag:"Upload",
    desc:"Upload document (PDF/DOC/TXT) and get compliance suggestions",
    body:"multipart/form-data — file field",
    response:`{ "filename": "policy.pdf", "suggested_industry": "Healthcare", "suggested_data_types": [...], "detected_topics": [...] }`
  },
  {
    method:"POST", path:"/api/v1/chat/message", tag:"Chat",
    desc:"Send message to AI compliance assistant",
    body:`{ "content": "What are GDPR requirements?", "session_id": null }`,
    response:`{ "session_id": "uuid", "message": { "role": "assistant", "content": "..." } }`
  },
  {
    method:"GET", path:"/api/v1/dashboard/stats", tag:"Dashboard",
    desc:"Get compliance statistics for authenticated user",
    body:null,
    response:`{ "total_checks": 15, "avg_score": 68, "compliant_count": 5, "recent_checks": [...] }`
  },
  {
    method:"GET", path:"/api/v1/dashboard/analytics", tag:"Dashboard",
    desc:"Get detailed analytics — country breakdown, trends, industries",
    body:null,
    response:`{ "country_breakdown": { "EU": 8, "India": 6 }, "status_breakdown": { ... }, "monthly_trend": { ... } }`
  },
]

const TAG_COLORS: any = {
  "Compliance": "#4F8EF7",
  "Auth": "#22C55E",
  "Upload": "#F59E0B",
  "Chat": "#7C3AED",
  "Dashboard": "#06B6D4",
}

const METHOD_COLORS: any = {
  "GET": "#22C55E",
  "POST": "#4F8EF7",
  "DELETE": "#EF4444",
  "PUT": "#F59E0B",
}

export default function APIDocsPage() {
  const [expanded, setExpanded] = useState<number|null>(null)
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState<string|null>(null)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id); toast.success("Copied!")
    setTimeout(() => setCopied(null), 2000)
  }

  const BASE_URL = "https://complianceai-backend-4gyi.onrender.com"

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:20, padding:"5px 14px", marginBottom:"1rem" }}>
            <span style={{ fontSize:11, fontWeight:600, color:"#4F8EF7", textTransform:"uppercase", letterSpacing:"0.08em" }}>REST API</span>
          </div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>API Documentation</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Integrate ComplianceAI into your own applications</p>
        </div>

        <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"1.5rem", marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
          <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Base URL</h3>
          <div style={{ display:"flex", alignItems:"center", gap:10, background:"#0A1628", borderRadius:10, padding:"0.875rem 1rem", border:"1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily:"monospace", fontSize:14, color:"#22C55E", flex:1 }}>{BASE_URL}</span>
            <button onClick={() => copy(BASE_URL, "base")} style={{ padding:"5px 12px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:12 }}>{copied==="base" ? "Copied!" : "Copy"}</button>
          </div>
          <div style={{ marginTop:"1rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div style={{ background:"#0A1628", borderRadius:10, padding:"0.875rem", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:11, color:"#64748B", marginBottom:4 }}>AUTHENTICATION</div>
              <div style={{ fontFamily:"monospace", fontSize:12, color:"#94A3B8" }}>Bearer Token (JWT)</div>
              <div style={{ fontFamily:"monospace", fontSize:12, color:"#94A3B8", marginTop:2 }}>Authorization: Bearer your_token</div>
            </div>
            <div style={{ background:"#0A1628", borderRadius:10, padding:"0.875rem", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:11, color:"#64748B", marginBottom:4 }}>CONTENT TYPE</div>
              <div style={{ fontFamily:"monospace", fontSize:12, color:"#94A3B8" }}>application/json</div>
              <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>Rate limit: 100 req/min</div>
            </div>
          </div>
        </div>

        <div style={{ opacity:visible?1:0, transition:"all 0.5s ease 0.2s" }}>
          {ENDPOINTS.map((ep: any, i: number) => (
            <div key={i} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, marginBottom:10, overflow:"hidden", backdropFilter:"blur(10px)" }}>
              <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ display:"flex", alignItems:"center", gap:12, padding:"1rem 1.25rem", cursor:"pointer" }}>
                <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, background:`${METHOD_COLORS[ep.method]}20`, color:METHOD_COLORS[ep.method], minWidth:48, textAlign:"center", fontFamily:"monospace" }}>{ep.method}</span>
                <span style={{ fontFamily:"monospace", fontSize:13, color:"#fff", flex:1 }}>{ep.path}</span>
                <span style={{ fontSize:11, padding:"2px 10px", borderRadius:20, background:`${TAG_COLORS[ep.tag]}15`, color:TAG_COLORS[ep.tag] }}>{ep.tag}</span>
                <span style={{ color:"#64748B", fontSize:18 }}>{expanded === i ? "−" : "+"}</span>
              </div>
              {expanded === i && (
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"1.25rem" }}>
                  <p style={{ fontSize:13, color:"#94A3B8", marginBottom:"1rem" }}>{ep.desc}</p>
                  {ep.body && (
                    <div style={{ marginBottom:"1rem" }}>
                      <div style={{ fontSize:11, color:"#64748B", marginBottom:6, textTransform:"uppercase" }}>Request Body</div>
                      <div style={{ position:"relative" }}>
                        <pre style={{ background:"#0A1628", borderRadius:10, padding:"1rem", fontSize:12, color:"#22C55E", overflow:"auto", border:"1px solid rgba(255,255,255,0.06)", margin:0, fontFamily:"monospace" }}>{ep.body}</pre>
                        <button onClick={() => copy(ep.body, `body-${i}`)} style={{ position:"absolute", top:8, right:8, padding:"4px 10px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(0,0,0,0.5)", color:"#94A3B8", cursor:"pointer", fontSize:11 }}>{copied===`body-${i}`?"Copied!":"Copy"}</button>
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:6, textTransform:"uppercase" }}>Response</div>
                    <pre style={{ background:"#0A1628", borderRadius:10, padding:"1rem", fontSize:12, color:"#4F8EF7", overflow:"auto", border:"1px solid rgba(255,255,255,0.06)", margin:0, fontFamily:"monospace" }}>{ep.response}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
