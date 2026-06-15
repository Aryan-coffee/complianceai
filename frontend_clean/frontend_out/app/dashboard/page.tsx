"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { dashboardAPI } from "@/lib/api"
import Navbar from "@/components/Navbar"
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading])
  useEffect(() => { if (user) dashboardAPI.stats().then(r => setStats(r.data)).catch(() => {}) }, [user])
  if (loading || !user) return null
  return (
    <div style={{ minHeight:"100vh", background:"#0A1628" }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"6rem 2rem 2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
          <div>
            <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>Dashboard</h1>
            <p style={{ color:"#94A3B8", marginTop:4, fontSize:14 }}>Welcome back, {user.full_name}</p>
          </div>
          <Link href="/compliance" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#4F8EF7", color:"#fff", textDecoration:"none", padding:"12px 20px", borderRadius:10, fontWeight:500, fontSize:14 }}>+ New Check</Link>
        </div>
        <div style={{ background:"#112240", border:"1px solid rgba(79,142,247,0.2)", borderRadius:12, padding:"1rem 1.5rem", marginBottom:"2rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, background:"rgba(79,142,247,0.2)", color:"#4F8EF7", textTransform:"uppercase" }}>{user.plan}</span>
            <span style={{ fontSize:14, color:"#94A3B8" }}>{stats ? stats.checks_remaining + " checks remaining" : "Loading..."}</span>
          </div>
          {user.plan === "free" && <Link href="/pricing" style={{ fontSize:13, color:"#4F8EF7", textDecoration:"none" }}>Upgrade plan</Link>}
        </div>
        {stats ? (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
              {[["Total Checks", stats.total_checks, "#4F8EF7"], ["Avg Score", stats.avg_score + "/100", "#22C55E"], ["Compliant", stats.compliant_count, "#22C55E"], ["Non-Compliant", stats.non_compliant_count, "#EF4444"]].map(([l,v,c]) => (
                <div key={String(l)} className="card">
                  <div style={{ fontSize:13, color:"#94A3B8", marginBottom:8 }}>{l}</div>
                  <div style={{ fontSize:"1.8rem", fontWeight:700, color:String(c) }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
                <h2 style={{ fontSize:"1rem", fontWeight:600 }}>Recent Checks</h2>
                <Link href="/compliance" style={{ fontSize:13, color:"#4F8EF7", textDecoration:"none" }}>Run new check</Link>
              </div>
              {stats.recent_checks.length === 0 ? (
                <div style={{ textAlign:"center", padding:"3rem", color:"#64748B" }}>
                  <p style={{ marginBottom:"1rem" }}>No compliance checks yet</p>
                  <Link href="/compliance" style={{ color:"#4F8EF7", textDecoration:"none", fontSize:14 }}>Run your first check</Link>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {stats.recent_checks.map((c: any) => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", background:"#0A1628", borderRadius:10, border:"1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:500, color:"#fff", marginBottom:4 }}>{c.ai_system_name}</div>
                        <div style={{ fontSize:12, color:"#64748B" }}>{(c.selected_countries || []).join(", ")} - {new Date(c.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ fontFamily:"monospace", fontSize:18, fontWeight:700, color: c.overall_score > 70 ? "#22C55E" : c.overall_score > 40 ? "#F59E0B" : "#EF4444" }}>{c.overall_score ?? "-"}</div>
                      <span className={c.status === "Compliant" ? "badge-compliant" : c.status === "Non-Compliant" ? "badge-non" : "badge-partial"}>{c.status || "Pending"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : <div style={{ textAlign:"center", padding:"3rem", color:"#64748B" }}>Loading...</div>}
      </div>
    </div>
  )
}
