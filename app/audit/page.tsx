
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import api from "@/lib/api"

export default function AuditPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [visible, setVisible] = useState(false)
  const [filter, setFilter] = useState("all")

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => {
    if (user) { setTimeout(() => setVisible(true), 100); loadLogs() }
  }, [user])

  const loadLogs = async () => {
    try {
      const [checks, sessions] = await Promise.all([
        api.get("/compliance/checks"),
        api.get("/chat/sessions")
      ])
      const checkLogs = (checks.data || []).map((c: any) => ({
        id:c.id, type:"compliance_check", icon:"🔍",
        title:`Compliance check: ${c.ai_system_name}`,
        detail:`${(c.selected_countries||[]).join(", ")} — Score: ${c.overall_score ?? "-"}`,
        status:c.status, time:c.created_at, color:"#4F8EF7"
      }))
      const chatLogs = (sessions.data || []).map((s: any) => ({
        id:s.id, type:"chat", icon:"💬",
        title:`AI Chat: ${s.title}`,
        detail:`${s.message_count} messages`,
        status:"completed", time:s.updated_at, color:"#7C3AED"
      }))
      const allLogs = [...checkLogs, ...chatLogs].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setLogs(allLogs)
    } catch {}
  }

  const filtered = filter === "all" ? logs : logs.filter((l: any) => l.type === filter)
  if (loading || !user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Audit Trail</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Complete log of all your compliance activities</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:"2rem" }}>
          {[
            { label:"Total Activities", value:logs.length, color:"#4F8EF7" },
            { label:"Compliance Checks", value:logs.filter((l: any) => l.type==="compliance_check").length, color:"#22C55E" },
            { label:"AI Chat Sessions", value:logs.filter((l: any) => l.type==="chat").length, color:"#7C3AED" },
          ].map((s: any) => (
            <div key={s.label} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem", backdropFilter:"blur(10px)" }}>
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:"2rem", fontWeight:700, fontFamily:"monospace", color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:"1.5rem" }}>
          {[["all","All"],["compliance_check","Checks"],["chat","Chat"]].map(([val, label]: any) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding:"7px 16px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:500, background:filter===val?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"rgba(17,34,64,0.8)", border:filter===val?"none":"1px solid rgba(255,255,255,0.06)", color:filter===val?"#fff":"#94A3B8" }}>{label}</button>
          ))}
        </div>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:20, top:0, bottom:0, width:2, background:"rgba(79,142,247,0.15)" }} />
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"4rem", color:"#64748B" }}>
              <div style={{ fontSize:48, marginBottom:"1rem" }}>📋</div>
              <p>No activities yet — run a compliance check!</p>
            </div>
          ) : filtered.map((log: any, i: number) => (
            <div key={log.id} style={{ display:"flex", gap:"1.5rem", marginBottom:"1rem", paddingLeft:10, opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-20px)", transition:`all 0.4s ease ${i*0.04}s` }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:`${log.color}20`, border:`2px solid ${log.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, marginTop:12, zIndex:1 }}>{log.icon}</div>
              <div style={{ flex:1, background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"1rem 1.25rem", backdropFilter:"blur(10px)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{log.title}</div>
                    <div style={{ fontSize:12, color:"#64748B" }}>{log.detail}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:11, color:"#64748B" }}>{log.time ? new Date(log.time).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "-"}</div>
                    {log.status && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:log.status==="Compliant"?"rgba(34,197,94,0.15)":"rgba(245,158,11,0.15)", color:log.status==="Compliant"?"#22C55E":"#F59E0B", display:"inline-block", marginTop:4 }}>{log.status}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
