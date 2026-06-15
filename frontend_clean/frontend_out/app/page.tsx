"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
export default function HomePage() {
  const [score, setScore] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      let s = 0
      const t = setInterval(() => { s++; setScore(s); if (s >= 37) clearInterval(t) }, 40)
    }, 800)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div style={{ minHeight:"100vh", background:"#0A1628" }}>
      <Navbar />
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", padding:"8rem 2rem 4rem" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.25)", borderRadius:20, padding:"5px 16px", marginBottom:"1.5rem" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#4F8EF7", display:"inline-block" }}></span>
              <span style={{ fontSize:11, fontWeight:600, color:"#4F8EF7", textTransform:"uppercase" }}>AI Governance Platform</span>
            </div>
            <h1 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:700, lineHeight:1.15, marginBottom:"1.25rem" }}>
              AI compliance across <span style={{ color:"#4F8EF7" }}>10 countries</span> in minutes
            </h1>
            <p style={{ fontSize:"1.05rem", color:"#94A3B8", lineHeight:1.7, marginBottom:"2rem" }}>
              Replace expensive legal consultants with instant AI-powered compliance checks. Multi-country analysis with PDF reports for $12/month.
            </p>
            <div style={{ display:"flex", gap:12 }}>
              <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#4F8EF7", color:"#fff", textDecoration:"none", padding:"14px 28px", borderRadius:10, fontWeight:500, fontSize:15 }}>Start free</Link>
              <Link href="/pricing" style={{ display:"inline-flex", alignItems:"center", background:"transparent", color:"#fff", textDecoration:"none", padding:"14px 28px", borderRadius:10, fontWeight:500, fontSize:15, border:"1px solid rgba(79,142,247,0.3)" }}>View pricing</Link>
            </div>
          </div>
          <div style={{ background:"#112240", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"2rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
              <span style={{ fontSize:13, color:"#94A3B8" }}>Live compliance analysis</span>
              <span style={{ fontSize:11, color:"#22C55E", fontFamily:"monospace" }}>LIVE</span>
            </div>
            <div style={{ background:"#0A1628", borderRadius:10, padding:"1rem", marginBottom:"1rem", fontSize:11, color:"#94A3B8", fontFamily:"monospace", lineHeight:1.6 }}>
              <div style={{ color:"#4F8EF7", fontSize:10, marginBottom:6, textTransform:"uppercase" }}>AI System</div>
              Facial recognition hiring tool scanning candidate video interviews for personality assessment. Deployed EU and India.
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
              {["EU AI Act", "DPDP Act", "NIST RMF"].map(c => (
                <span key={c} style={{ fontSize:12, fontWeight:500, padding:"5px 12px", borderRadius:6, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.2)", color:"#4F8EF7" }}>{c}</span>
              ))}
            </div>
            {[
              { name:"European Union", width:"28%", color:"#EF4444", status:"Non-Compliant" },
              { name:"India", width:"55%", color:"#F59E0B", status:"Partial" },
              { name:"United States", width:"48%", color:"#F59E0B", status:"Partial" },
            ].map(r => (
              <div key={r.name} style={{ display:"flex", alignItems:"center", gap:10, background:"#0A1628", border:"1px solid rgba(255,255,255,0.05)", borderRadius:10, padding:"10px", marginBottom:8 }}>
                <span style={{ fontSize:12, flex:1, color:"#fff" }}>{r.name}</span>
                <div style={{ flex:2, height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                  <div style={{ height:"100%", width:r.width, background:r.color, borderRadius:2 }} />
                </div>
                <span style={{ fontSize:11, color:r.color, fontWeight:600, minWidth:80, textAlign:"right" }}>{r.status}</span>
              </div>
            ))}
            <div style={{ marginTop:"1.5rem", paddingTop:"1rem", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"baseline", gap:8 }}>
              <span style={{ fontFamily:"monospace", fontSize:"2.5rem", fontWeight:700, color:"#4F8EF7" }}>{score}</span>
              <span style={{ fontSize:13, color:"#94A3B8" }}>/ 100 overall score</span>
            </div>
          </div>
        </div>
      </section>
      <div style={{ background:"#112240", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"2.5rem 2rem" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"2rem", textAlign:"center" }}>
          {[["10+","Countries"],["60s","Per check"],["$500/hr","Cost replaced"],["$12/mo","Starting price"]].map(([n,l]) => (
            <div key={l}><div style={{ fontFamily:"monospace", fontSize:"2rem", fontWeight:700 }}>{n}</div><div style={{ fontSize:13, color:"#94A3B8", marginTop:4 }}>{l}</div></div>
          ))}
        </div>
      </div>
      <section style={{ padding:"6rem 2rem", textAlign:"center" }}>
        <h2 style={{ fontSize:"2rem", fontWeight:700, marginBottom:"1rem" }}>Your AI is probably non-compliant somewhere.</h2>
        <p style={{ color:"#94A3B8", marginBottom:"2rem" }}>Find out in 60 seconds. Free plan, no credit card.</p>
        <Link href="/auth/register" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#4F8EF7", color:"#fff", textDecoration:"none", padding:"16px 32px", borderRadius:12, fontWeight:600, fontSize:16 }}>Start for free</Link>
      </section>
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"2rem", display:"flex", justifyContent:"space-between", maxWidth:1200, margin:"0 auto" }}>
        <span style={{ fontSize:13, color:"#64748B" }}>ComplianceAI 2024</span>
        <div style={{ display:"flex", gap:"1.5rem" }}>
          {["Privacy","Terms","Contact"].map(l => <a key={l} href="#" style={{ fontSize:13, color:"#64748B", textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  )
}
