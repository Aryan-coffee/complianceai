
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import api from "@/lib/api"
import Link from "next/link"

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => {
    if (user) {
      api.get("/dashboard/analytics").then((r: any) => {
        setData(r.data)
        setTimeout(() => setVisible(true), 100)
      }).catch(() => {})
    }
  }, [user])

  if (loading || !user) return null

  const countries = data ? Object.entries(data.country_breakdown) : []
  const maxCount = countries.length > 0 ? Math.max(...countries.map(([,v]: any) => v)) : 1

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Analytics</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Your compliance activity overview</p>
        </div>

        {!data ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"#64748B" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid rgba(79,142,247,0.2)", borderTop:"3px solid #4F8EF7", margin:"0 auto 1rem", animation:"spin 1s linear infinite" }} />
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            Loading analytics...
          </div>
        ) : data.total_checks === 0 ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"#64748B" }}>
            <div style={{ fontSize:64, marginBottom:"1rem" }}>📊</div>
            <h3 style={{ fontSize:"1.2rem", color:"#fff", marginBottom:"0.5rem" }}>No data yet</h3>
            <p style={{ marginBottom:"1.5rem" }}>Run compliance checks to see analytics</p>
            <Link href="/compliance" style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"12px 24px", borderRadius:10, fontWeight:500 }}>Run first check</Link>
          </div>
        ) : (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
              {[
                { label:"Total Checks", value:data.total_checks, color:"#4F8EF7" },
                { label:"Avg Score", value:`${data.avg_score}/100`, color:"#22C55E" },
                { label:"Compliant", value:data.status_breakdown.compliant, color:"#22C55E" },
                { label:"Non-Compliant", value:data.status_breakdown.non_compliant, color:"#EF4444" },
              ].map((s: any) => (
                <div key={s.label} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem", backdropFilter:"blur(10px)" }}>
                  <div style={{ fontSize:13, color:"#94A3B8", marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:"2rem", fontWeight:700, fontFamily:"monospace", color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease 0.2s" }}>
              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
                <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.25rem", color:"#4F8EF7" }}>Checks by Country</h3>
                {countries.map(([country, count]: any, i: number) => (
                  <div key={country} style={{ marginBottom:12, opacity:visible?1:0, transition:`all 0.4s ease ${0.3+i*0.05}s` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                      <span style={{ color:"#fff", fontWeight:500 }}>{country}</span>
                      <span style={{ color:"#64748B" }}>{count} checks</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(count/maxCount)*100}%`, background:"linear-gradient(90deg,#4F8EF7,#7C3AED)", borderRadius:3, transition:"width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
                <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.25rem", color:"#4F8EF7" }}>Status Breakdown</h3>
                {[
                  { label:"Compliant", value:data.status_breakdown.compliant, color:"#22C55E", bg:"rgba(34,197,94,0.1)" },
                  { label:"Partially Compliant", value:data.status_breakdown.partial, color:"#F59E0B", bg:"rgba(245,158,11,0.1)" },
                  { label:"Non-Compliant", value:data.status_breakdown.non_compliant, color:"#EF4444", bg:"rgba(239,68,68,0.1)" },
                ].map((s: any) => (
                  <div key={s.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem", background:s.bg, borderRadius:10, marginBottom:10, border:`1px solid ${s.color}30` }}>
                    <span style={{ fontSize:14, color:"#fff" }}>{s.label}</span>
                    <span style={{ fontSize:"1.5rem", fontWeight:700, fontFamily:"monospace", color:s.color }}>{s.value}</span>
                  </div>
                ))}

                <h3 style={{ fontSize:"1rem", fontWeight:600, margin:"1.5rem 0 1rem", color:"#4F8EF7" }}>Top Industries</h3>
                {Object.entries(data.top_industries || {}).map(([ind, cnt]: any) => (
                  <div key={ind} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:13 }}>
                    <span style={{ color:"#94A3B8" }}>{ind}</span>
                    <span style={{ color:"#fff", fontWeight:500 }}>{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
