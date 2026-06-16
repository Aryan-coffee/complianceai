
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import api from "@/lib/api"
import Link from "next/link"

export default function ComparePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checks, setChecks] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => {
    if (user) {
      setTimeout(() => setVisible(true), 100)
      api.get("/compliance/checks").then((r: any) => setChecks(r.data || [])).catch(() => {})
    }
  }, [user])

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(prev => prev.filter((i: string) => i !== id))
    else if (selected.length < 3) setSelected(prev => [...prev, id])
    else toast.error("Max 3 systems to compare")
  }

  const selectedChecks = checks.filter((c: any) => selected.includes(c.id))

  if (loading || !user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Compare AI Systems</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Compare compliance scores across your AI systems — select up to 3</p>
        </div>

        {checks.length === 0 ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"#64748B" }}>
            <div style={{ fontSize:64, marginBottom:"1rem" }}>📊</div>
            <h3 style={{ fontSize:"1.2rem", color:"#fff", marginBottom:"0.5rem" }}>No checks yet</h3>
            <p style={{ marginBottom:"1.5rem" }}>Run compliance checks first to compare</p>
            <Link href="/compliance" style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"12px 24px", borderRadius:10, fontWeight:500 }}>Run first check</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
              <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Select AI systems to compare ({selected.length}/3)</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {checks.map((c: any) => (
                  <div key={c.id} onClick={() => toggle(c.id)} style={{ display:"flex", alignItems:"center", gap:"1rem", background:selected.includes(c.id)?"rgba(79,142,247,0.15)":"rgba(17,34,64,0.8)", border:selected.includes(c.id)?"2px solid #4F8EF7":"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"1rem 1.25rem", cursor:"pointer", transition:"all 0.2s" }}>
                    <div style={{ width:20, height:20, borderRadius:4, background:selected.includes(c.id)?"#4F8EF7":"transparent", border:selected.includes(c.id)?"none":"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {selected.includes(c.id) && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600 }}>{c.ai_system_name}</div>
                      <div style={{ fontSize:12, color:"#64748B" }}>{c.industry} — {(c.selected_countries||[]).join(", ")}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontFamily:"monospace", fontSize:"1.4rem", fontWeight:700, color:c.overall_score>70?"#22C55E":c.overall_score>40?"#F59E0B":"#EF4444" }}>{c.overall_score}</span>
                      <span className={c.status==="Compliant"?"badge-compliant":c.status==="Non-Compliant"?"badge-non":"badge-partial"}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedChecks.length >= 2 && (
              <div style={{ opacity:visible?1:0, transition:"all 0.5s ease 0.2s" }}>
                <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Comparison</h3>
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${selectedChecks.length},1fr)`, gap:"1rem" }}>
                  {selectedChecks.map((c: any) => (
                    <div key={c.id} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
                      <div style={{ textAlign:"center", marginBottom:"1.25rem" }}>
                        <div style={{ fontSize:"3rem", fontWeight:800, fontFamily:"monospace", color:c.overall_score>70?"#22C55E":c.overall_score>40?"#F59E0B":"#EF4444" }}>{c.overall_score}</div>
                        <div style={{ fontSize:12, color:"#64748B" }}>/ 100</div>
                        <h3 style={{ fontSize:"1rem", fontWeight:600, marginTop:8, marginBottom:4 }}>{c.ai_system_name}</h3>
                        <span className={c.status==="Compliant"?"badge-compliant":c.status==="Non-Compliant"?"badge-non":"badge-partial"}>{c.status}</span>
                      </div>
                      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:"1rem" }}>
                        {[
                          { label:"Risk Level", value:c.overall_risk, color:c.overall_risk==="High"?"#EF4444":c.overall_risk==="Medium"?"#F59E0B":"#22C55E" },
                          { label:"Industry", value:c.industry, color:"#94A3B8" },
                          { label:"Countries", value:(c.selected_countries||[]).length+" countries", color:"#4F8EF7" },
                          { label:"Issues", value:c.critical_issues_count+" found", color:c.critical_issues_count>5?"#EF4444":"#F59E0B" },
                        ].map((row: any) => (
                          <div key={row.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:13 }}>
                            <span style={{ color:"#64748B" }}>{row.label}</span>
                            <span style={{ color:row.color, fontWeight:500 }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
