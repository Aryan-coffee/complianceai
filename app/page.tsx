
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

export default function HomePage() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const COUNTRIES = [
    { code:"EU", name:"European Union", law:"EU AI Act", color:"#4F8EF7" },
    { code:"IN", name:"India", law:"DPDP Act", color:"#F59E0B" },
    { code:"US", name:"USA", law:"NIST AI RMF", color:"#22C55E" },
    { code:"GB", name:"United Kingdom", law:"UK AI Framework", color:"#7C3AED" },
    { code:"CA", name:"Canada", law:"AIDA", color:"#EF4444" },
    { code:"SG", name:"Singapore", law:"Model AI Gov", color:"#06B6D4" },
    { code:"AU", name:"Australia", law:"AI Ethics Framework", color:"#10B981" },
    { code:"BR", name:"Brazil", law:"Lei de IA", color:"#F97316" },
    { code:"CN", name:"China", law:"GenAI Regulations", color:"#EF4444" },
    { code:"JP", name:"Japan", law:"AI Guidelines", color:"#8B5CF6" },
  ]

  const FEATURES = [
    { icon:"⚡", title:"60 seconds", desc:"Instant analysis vs weeks of legal review" },
    { icon:"🌍", title:"10 countries", desc:"EU, India, USA, UK, Canada & more" },
    { icon:"📄", title:"PDF reports", desc:"Board-ready compliance documentation" },
    { icon:"🏛️", title:"AI Audit", desc:"32-question governance assessment" },
    { icon:"💬", title:"AI Chat", desc:"Expert compliance Q&A 24/7" },
    { icon:"🔒", title:"Secure", desc:"GDPR & DPDP compliant platform" },
  ]

  return (
    <div style={{ minHeight:"100dvh", background:"#0A1628", color:"#fff", overflowX:"hidden" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        * { box-sizing: border-box; }
      `}</style>

      {/* MOBILE-FIRST NAVBAR */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(10,22,40,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1rem", height:56 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13 }}>CA</div>
            <span style={{ fontSize:15, fontWeight:700, color:"#fff" }}>ComplianceAI</span>
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {user ? (
              <>
                <Link href="/dashboard" style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600 }}>Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ color:"#94A3B8", textDecoration:"none", fontSize:13, padding:"8px 12px" }}>Sign in</Link>
                <Link href="/auth/register" style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600 }}>Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop:56, minHeight:"100dvh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"56px 1.25rem 2rem", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.15) 0%,transparent 70%)", top:-50, right:-50, pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1, maxWidth:480, margin:"0 auto", width:"100%" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:20, padding:"5px 12px", marginBottom:"1.25rem", opacity:visible?1:0, animation:visible?"fadeUp 0.5s ease":"none" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#4F8EF7", animation:"shimmer 2s infinite", display:"inline-block" }} />
            <span style={{ fontSize:11, fontWeight:600, color:"#4F8EF7", textTransform:"uppercase", letterSpacing:"0.08em" }}>AI Governance Platform</span>
          </div>

          <h1 style={{ fontSize:"clamp(2rem,8vw,3.5rem)", fontWeight:800, lineHeight:1.15, letterSpacing:"-0.02em", marginBottom:"1.25rem", opacity:visible?1:0, animation:visible?"fadeUp 0.5s ease 0.1s both":"none" }}>
            AI compliance<br/>
            across <span style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>10 countries</span><br/>
            in minutes
          </h1>

          <p style={{ fontSize:"clamp(14px,4vw,17px)", color:"#94A3B8", lineHeight:1.7, marginBottom:"2rem", opacity:visible?1:0, animation:visible?"fadeUp 0.5s ease 0.2s both":"none" }}>
            Replace <span style={{ color:"#EF4444", fontWeight:600 }}>$500/hr</span> legal consultants with instant AI-powered compliance checks. Multi-country analysis with PDF reports for <span style={{ color:"#22C55E", fontWeight:600 }}>$12/month</span>.
          </p>

          <div style={{ display:"flex", gap:10, marginBottom:"2rem", opacity:visible?1:0, animation:visible?"fadeUp 0.5s ease 0.3s both":"none" }}>
            <Link href={user?"/compliance":"/auth/register"} style={{ flex:1, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"14px", borderRadius:12, fontWeight:700, fontSize:15, textAlign:"center", boxShadow:"0 0 25px rgba(79,142,247,0.4)" }}>
              {user?"Run Check":"Start free"}
            </Link>
            <Link href="/regulations" style={{ flex:1, background:"rgba(255,255,255,0.05)", color:"#fff", textDecoration:"none", padding:"14px", borderRadius:12, fontWeight:500, fontSize:15, textAlign:"center", border:"1px solid rgba(255,255,255,0.1)" }}>
              View regulations
            </Link>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:6, opacity:visible?1:0, animation:visible?"fadeUp 0.5s ease 0.4s both":"none" }}>
            {["No credit card required","3 free checks/month","PDF report included"].map((t: string) => (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#64748B" }}>
                <span style={{ color:"#22C55E", fontSize:14 }}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE STATS STRIP */}
      <div style={{ background:"rgba(17,34,64,0.8)", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"1.25rem 1.25rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", maxWidth:480, margin:"0 auto", textAlign:"center" }}>
          {[
            { value:"10+", label:"Countries" },
            { value:"60s", label:"Analysis time" },
            { value:"Free", label:"To start" },
          ].map((s: any) => (
            <div key={s.label}>
              <div style={{ fontSize:"1.6rem", fontWeight:800, fontFamily:"monospace", color:"#4F8EF7" }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COUNTRIES */}
      <div style={{ padding:"2.5rem 1.25rem" }}>
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <h2 style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:"0.5rem", textAlign:"center" }}>Regulations we cover</h2>
          <p style={{ fontSize:13, color:"#64748B", textAlign:"center", marginBottom:"1.5rem" }}>Stay compliant across all major AI governance frameworks</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {COUNTRIES.map((c: any, i: number) => (
              <div key={c.code} style={{ background:"rgba(17,34,64,0.8)", border:`1px solid ${c.color}20`, borderLeft:`3px solid ${c.color}`, borderRadius:10, padding:"10px 12px", opacity:visible?1:0, animation:visible?`fadeUp 0.5s ease ${i*0.05}s both`:"none" }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{c.name}</div>
                <div style={{ fontSize:11, color:"#64748B" }}>{c.law}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding:"0 1.25rem 2.5rem", background:"rgba(7,15,30,0.5)" }}>
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <h2 style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:"0.5rem", textAlign:"center", paddingTop:"2.5rem" }}>Why ComplianceAI?</h2>
          <p style={{ fontSize:13, color:"#64748B", textAlign:"center", marginBottom:"1.5rem" }}>Built for startups, enterprises, and compliance teams</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {FEATURES.map((f: any, i: number) => (
              <div key={f.title} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"1.25rem 1rem", textAlign:"center", opacity:visible?1:0, animation:visible?`fadeUp 0.5s ease ${i*0.05}s both`:"none" }}>
                <div style={{ fontSize:28, marginBottom:"0.5rem" }}>{f.icon}</div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{f.title}</div>
                <div style={{ fontSize:11, color:"#64748B", lineHeight:1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:"2.5rem 1.25rem", textAlign:"center" }}>
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <h2 style={{ fontSize:"1.4rem", fontWeight:700, marginBottom:"0.75rem" }}>Ready to check compliance?</h2>
          <p style={{ fontSize:14, color:"#64748B", marginBottom:"1.5rem" }}>Join thousands of AI teams staying compliant</p>
          <Link href={user?"/compliance":"/auth/register"} style={{ display:"block", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"16px", borderRadius:12, fontWeight:700, fontSize:15, boxShadow:"0 0 25px rgba(79,142,247,0.3)" }}>
            {user?"Run Compliance Check →":"Get started free →"}
          </Link>
          <p style={{ fontSize:12, color:"#475569", marginTop:"1rem" }}>All plans include: Groq AI · Secure encryption · Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
