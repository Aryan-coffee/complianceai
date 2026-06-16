
"use client"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"

const DEADLINES = [
  { id:1, date:"2024-08-01", country:"EU", flag:"EU", law:"EU AI Act", event:"Prohibited AI systems ban effective", impact:"High", color:"#EF4444", desc:"Article 5 absolute prohibitions take effect. Emotion recognition in workplaces, social scoring, real-time biometric surveillance all banned." },
  { id:2, date:"2025-02-02", country:"EU", flag:"EU", law:"EU AI Act", event:"GPAI model obligations begin", impact:"High", color:"#EF4444", desc:"General Purpose AI models must comply with transparency and copyright rules. Foundation model providers must register." },
  { id:3, date:"2025-08-02", country:"EU", flag:"EU", law:"EU AI Act", event:"High-risk AI obligations begin", impact:"High", color:"#EF4444", desc:"All high-risk AI systems (Annex III) must have conformity assessment, human oversight, and technical documentation." },
  { id:4, date:"2026-08-02", country:"EU", flag:"EU", law:"EU AI Act", event:"Full EU AI Act enforcement", impact:"High", color:"#EF4444", desc:"Complete enforcement begins. Fines up to 35M euros or 7% global revenue for violations." },
  { id:5, date:"2024-12-01", country:"India", flag:"IN", law:"DPDP Act", event:"DPDP Act rules notified", impact:"High", color:"#F59E0B", desc:"Digital Personal Data Protection Act 2023 implementation rules expected. Consent frameworks and data fiduciary obligations." },
  { id:6, date:"2025-06-01", country:"India", flag:"IN", law:"DPDP Act", event:"DPDP enforcement begins", impact:"High", color:"#F59E0B", desc:"Penalties up to Rs 250 crore for data protection violations. Data Protection Board to be constituted." },
  { id:7, date:"2025-01-01", country:"Brazil", flag:"BR", law:"Lei de IA", event:"Brazil AI Bill expected vote", impact:"Medium", color:"#10B981", desc:"PL 2338/2023 Senate vote expected. High-risk AI conformity assessment requirements." },
  { id:8, date:"2025-03-01", country:"Canada", flag:"CA", law:"AIDA", event:"AIDA third reading expected", impact:"Medium", color:"#8B5CF6", desc:"Artificial Intelligence and Data Act expected to pass third reading in Parliament." },
  { id:9, date:"2025-01-01", country:"USA", flag:"US", law:"EO 14110", event:"AI safety reports due", impact:"Medium", color:"#4F8EF7", desc:"Federal agencies must submit AI safety and red-team testing reports per Executive Order 14110." },
  { id:10, date:"2024-10-01", country:"China", flag:"CN", law:"GenAI Regs", event:"GenAI Regulations enforcement", impact:"High", color:"#EF4444", desc:"China Generative AI Regulations fully enforced. All GenAI services must be registered with CAC." },
  { id:11, date:"2025-09-01", country:"UK", flag:"GB", law:"UK AI Framework", event:"UK AI Safety Bill expected", impact:"Medium", color:"#22C55E", desc:"UK Government expected to introduce AI Safety legislation following AI Safety Summit commitments." },
  { id:12, date:"2025-04-01", country:"Singapore", flag:"SG", law:"Model AI Gov", event:"AI Verify 2.0 launch", impact:"Low", color:"#06B6D4", desc:"Singapore AI Verify testing framework version 2.0 with expanded governance dimensions." },
]

export default function CalendarPage() {
  const [filter, setFilter] = useState("all")
  const [view, setView] = useState("timeline")
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const today = new Date()
  const sorted = [...DEADLINES].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const filtered = filter === "all" ? sorted : sorted.filter((d: any) => d.country === filter)
  const upcoming = filtered.filter((d: any) => new Date(d.date) >= today)
  const past = filtered.filter((d: any) => new Date(d.date) < today)

  const getDaysLeft = (date: string) => {
    const diff = new Date(date).getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return { text: `${Math.abs(days)} days ago`, color: "#64748B" }
    if (days === 0) return { text: "Today!", color: "#EF4444" }
    if (days <= 30) return { text: `${days} days left`, color: "#EF4444" }
    if (days <= 90) return { text: `${days} days left`, color: "#F59E0B" }
    return { text: `${days} days left`, color: "#22C55E" }
  }

  const COUNTRIES = ["all","EU","India","USA","UK","Canada","Singapore","Brazil","China"]

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Compliance Calendar</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Track AI regulation deadlines across 10 countries</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
          {[
            { label:"Upcoming deadlines", value:upcoming.length, color:"#4F8EF7" },
            { label:"High impact", value:filtered.filter((d: any) => d.impact==="High").length, color:"#EF4444" },
            { label:"Past deadlines", value:past.length, color:"#64748B" },
          ].map((s: any) => (
            <div key={s.label} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem", backdropFilter:"blur(10px)" }}>
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:"2rem", fontWeight:700, fontFamily:"monospace", color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:"1.5rem", flexWrap:"wrap", opacity:visible?1:0, transition:"all 0.5s ease 0.2s" }}>
          {COUNTRIES.map((c: string) => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:500, background:filter===c?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"rgba(17,34,64,0.8)", border:filter===c?"none":"1px solid rgba(255,255,255,0.06)", color:filter===c?"#fff":"#94A3B8", transition:"all 0.2s" }}>
              {c === "all" ? "All Countries" : c}
            </button>
          ))}
        </div>

        {upcoming.length > 0 && (
          <div style={{ marginBottom:"2rem" }}>
            <h2 style={{ fontSize:"1rem", fontWeight:600, color:"#4F8EF7", marginBottom:"1rem" }}>Upcoming Deadlines</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {upcoming.map((d: any, i: number) => {
                const days = getDaysLeft(d.date)
                return (
                  <div key={d.id} style={{ background:"rgba(17,34,64,0.8)", border:`1px solid ${d.color}30`, borderLeft:`4px solid ${d.color}`, borderRadius:14, padding:"1.25rem 1.5rem", backdropFilter:"blur(10px)", opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-20px)", transition:`all 0.4s ease ${i*0.05}s` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:`${d.color}20`, border:`1px solid ${d.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:d.color }}>{d.flag}</div>
                        <div>
                          <div style={{ fontSize:15, fontWeight:600 }}>{d.event}</div>
                          <div style={{ fontSize:12, color:"#64748B" }}>{d.law} — {d.country}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:days.color }}>{days.text}</div>
                        <div style={{ fontSize:12, color:"#64748B" }}>{new Date(d.date).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</div>
                      </div>
                    </div>
                    <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6, marginBottom:8 }}>{d.desc}</p>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:d.impact==="High"?"rgba(239,68,68,0.15)":d.impact==="Medium"?"rgba(245,158,11,0.15)":"rgba(34,197,94,0.15)", color:d.impact==="High"?"#EF4444":d.impact==="Medium"?"#F59E0B":"#22C55E", border:`1px solid ${d.impact==="High"?"rgba(239,68,68,0.3)":d.impact==="Medium"?"rgba(245,158,11,0.3)":"rgba(34,197,94,0.3)"}` }}>{d.impact} Impact</span>
                      <Link href="/compliance" style={{ fontSize:11, color:"#4F8EF7", textDecoration:"none" }}>Check compliance →</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 style={{ fontSize:"1rem", fontWeight:600, color:"#64748B", marginBottom:"1rem" }}>Past Deadlines</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {past.map((d: any) => (
                <div key={d.id} style={{ background:"rgba(17,34,64,0.4)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:12, padding:"1rem 1.5rem", opacity:0.6, backdropFilter:"blur(10px)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:11, color:"#64748B", fontWeight:700 }}>{d.flag}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:"#94A3B8" }}>{d.event}</div>
                        <div style={{ fontSize:11, color:"#64748B" }}>{d.law}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:"#64748B" }}>{new Date(d.date).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
