
"use client"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"

export default function AboutPage() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`@keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-200, right:-200 }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)", bottom:-100, left:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"8rem 2rem 4rem", position:"relative", zIndex:1 }}>

        <div style={{ textAlign:"center", marginBottom:"4rem", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(30px)", transition:"all 0.7s ease" }}>
          <div style={{ width:80, height:80, borderRadius:20, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", color:"#fff", fontWeight:700, fontSize:28, boxShadow:"0 0 40px rgba(79,142,247,0.4)" }}>CA</div>
          <h1 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:"1rem", background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>About ComplianceAI</h1>
          <p style={{ fontSize:"1.1rem", color:"#94A3B8", lineHeight:1.7, maxWidth:600, margin:"0 auto" }}>
            The world first AI-powered platform for instant, multi-country AI compliance analysis. Built for startups, enterprises, and compliance teams.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"3rem", opacity:visible?1:0, transition:"all 0.6s ease 0.1s" }}>
          {[
            { icon:"⚡", title:"60-second analysis", desc:"What lawyers take weeks to analyze, ComplianceAI does in under 60 seconds using Groq LLaMA AI." },
            { icon:"🌍", title:"10 countries covered", desc:"EU AI Act, India DPDP, US NIST, UK framework, Canada AIDA, Singapore, Australia, Brazil, China, Japan." },
            { icon:"📄", title:"Professional reports", desc:"Board-ready PDF compliance reports with risk scores, legal references, and step-by-step remediation." },
            { icon:"💬", title:"AI compliance chat", desc:"Ask our AI assistant anything about regulations. Get cited, accurate answers from actual law." },
            { icon:"📁", title:"Document analysis", desc:"Upload any AI policy, terms of service, or architecture document for instant compliance review." },
            { icon:"🔒", title:"Privacy first", desc:"Your data is encrypted, never sold, and handled under GDPR, DPDP Act, and global privacy standards." },
          ].map((f: any, i: number) => (
            <div key={i} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:`all 0.5s ease ${0.2+i*0.1}s` }}>
              <div style={{ fontSize:32, marginBottom:"0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"0.5rem" }}>{f.title}</h3>
              <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6, margin:0 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:20, padding:"2.5rem", marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.6s ease 0.5s" }}>
          <h2 style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:"1rem" }}>Tech Stack</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
            {[
              { label:"Frontend", value:"Next.js 16 + TypeScript" },
              { label:"Backend", value:"FastAPI + Python" },
              { label:"AI Engine", value:"Groq LLaMA 3.1" },
              { label:"Database", value:"SQLite + SQLAlchemy" },
              { label:"Auth", value:"JWT + Email OTP" },
              { label:"Deploy", value:"Vercel + Render" },
            ].map((t: any) => (
              <div key={t.label} style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"0.875rem" }}>
                <div style={{ fontSize:11, color:"#64748B", marginBottom:4, textTransform:"uppercase" }}>{t.label}</div>
                <div style={{ fontSize:13, fontWeight:500, fontFamily:"monospace", color:"#4F8EF7" }}>{t.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center", opacity:visible?1:0, transition:"all 0.6s ease 0.6s" }}>
          <h2 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:"1rem" }}>Ready to check your AI compliance?</h2>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <Link href="/auth/register" style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"14px 28px", borderRadius:12, fontWeight:600, fontSize:15 }}>Start free</Link>
            <Link href="/pricing" style={{ background:"transparent", color:"#fff", textDecoration:"none", padding:"14px 24px", borderRadius:12, border:"1px solid rgba(255,255,255,0.15)", fontSize:15 }}>View pricing</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
