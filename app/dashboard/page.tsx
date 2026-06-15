
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { dashboardAPI, complianceAPI } from "@/lib/api"
import Navbar from "@/components/Navbar"

function StatCard({ label, value, color, delay }: { label: string, value: any, color: string, delay: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = parseInt(value) || 0
    if (num === 0) { setDisplay(0); return }
    let start = 0
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        start += Math.ceil(num / 30)
        if (start >= num) { setDisplay(num); clearInterval(interval) }
        else setDisplay(start)
      }, 30)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className="card" style={{ transition:"transform 0.2s", cursor:"default" }}
      onMouseEnter={(e: any)=>e.currentTarget.style.transform="translateY(-4px)"}
      onMouseLeave={(e: any)=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{ fontSize:13, color:"#94A3B8", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:"2rem", fontWeight:700, color:color, fontFamily:"monospace" }}>
        {typeof value === "string" && value.includes("/") ? value : display}
      </div>
    </div>
  )
}

function PurchaseModal({ onClose, plan }: { onClose: ()=>void, plan: string }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}
      onClick={onClose}>
      <div onClick={(e: any)=>e.stopPropagation()} style={{ background:"#112240", border:"2px solid #4F8EF7", borderRadius:20, padding:"2.5rem", maxWidth:500, width:"100%", position:"relative" }}>
        <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:12, fontWeight:700, padding:"4px 20px", borderRadius:20, whiteSpace:"nowrap" }}>
          Upgrade to unlock
        </div>
        <div style={{ textAlign:"center", marginBottom:"1.5rem", marginTop:"0.5rem" }}>
          <div style={{ fontSize:48, marginBottom:"0.5rem" }}>🔒</div>
          <h2 style={{ fontSize:"1.5rem", fontWeight:700, marginBottom:"0.5rem" }}>Free limit reached!</h2>
          <p style={{ color:"#94A3B8", fontSize:14 }}>You have used all 3 free compliance checks this month. Upgrade to continue.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1.5rem" }}>
          {[
            { name:"Starter", price:"$12", inr:"Rs 999/mo", features:["5 countries","20 checks/month","PDF reports"], color:"#4F8EF7" },
            { name:"Pro", price:"$35", inr:"Rs 2,999/mo", features:["All 10 countries","Unlimited checks","Priority support"], color:"#22C55E", popular:true },
          ].map(p => (
            <div key={p.name} style={{ background:"#0A1628", border:p.popular?"2px solid #22C55E":"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"1.25rem", position:"relative" }}>
              {p.popular && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"#22C55E", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 12px", borderRadius:20, whiteSpace:"nowrap" }}>Most popular</div>}
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:"1.8rem", fontWeight:700, color:p.color, fontFamily:"monospace" }}>{p.price}</div>
              <div style={{ fontSize:11, color:"#64748B", marginBottom:"0.75rem" }}>{p.inr}</div>
              {p.features.map(f => (<div key={f} style={{ fontSize:12, color:"#94A3B8", marginBottom:4, display:"flex", gap:6 }}><span style={{ color:"#22C55E" }}>✓</span>{f}</div>))}
              <Link href="/pricing" style={{ display:"block", textAlign:"center", marginTop:"0.75rem", background:p.popular?"#22C55E":"#4F8EF7", color:"#fff", textDecoration:"none", padding:"8px", borderRadius:8, fontSize:13, fontWeight:500 }}>Get {p.name}</Link>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ width:"100%", background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px", color:"#64748B", cursor:"pointer", fontSize:13 }}>Maybe later</button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [showPurchase, setShowPurchase] = useState<boolean>(false)
  const [recentChecks, setRecentChecks] = useState<any[]>([])
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading])
  
  useEffect(() => {
    if (user) {
      dashboardAPI.stats().then(r => {
        setStats(r.data)
        setTimeout(() => setVisible(true), 100)
        if (r.data.checks_remaining === 0 && user.plan === "free") {
          setTimeout(() => setShowPurchase(true), 1000)
        }
      }).catch(() => {})
    }
  }, [user])

  const refreshChecks = async () => {
    if (!user) return
    try {
      const res = await dashboardAPI.stats()
      setStats(res.data)
    } catch {}
  }

  if (loading || !user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628" }}>
      <Navbar />
      {showPurchase && <PurchaseModal onClose={()=>setShowPurchase(false)} plan={user.plan} />}
      
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"6rem 2rem 2rem" }}>
        
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"all 0.5s ease" }}>
          <div>
            <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>Dashboard</h1>
            <p style={{ color:"#94A3B8", marginTop:4, fontSize:14 }}>Welcome back, <strong style={{ color:"#fff" }}>{user.full_name}</strong></p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={refreshChecks} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 14px", color:"#94A3B8", cursor:"pointer", fontSize:13 }}>Refresh</button>
            <Link href="/compliance" style={{ background:"#4F8EF7", color:"#fff", textDecoration:"none", padding:"10px 20px", borderRadius:10, fontWeight:500, fontSize:14 }}>+ New Check</Link>
          </div>
        </div>

        <div style={{ background:"linear-gradient(135deg,rgba(79,142,247,0.15),rgba(124,58,237,0.1))", border:"1px solid rgba(79,142,247,0.3)", borderRadius:12, padding:"1rem 1.5rem", marginBottom:"2rem", display:"flex", alignItems:"center", justifyContent:"space-between", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, background:"rgba(79,142,247,0.2)", color:"#4F8EF7", textTransform:"uppercase" }}>{user.plan}</span>
            <span style={{ fontSize:14, color:"#94A3B8" }}>
              {stats ? (
                stats.checks_remaining > 0
                  ? <><strong style={{ color:"#fff" }}>{stats.checks_remaining}</strong> checks remaining this month</>
                  : <span style={{ color:"#EF4444" }}>Monthly limit reached — upgrade to continue</span>
              ) : "Loading..."}
            </span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {user.plan === "free" && stats?.checks_remaining === 0 && (
              <button onClick={()=>setShowPurchase(true)} style={{ background:"#4F8EF7", border:"none", borderRadius:8, padding:"8px 16px", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:500 }}>Upgrade now</button>
            )}
            {user.plan === "free" && <Link href="/pricing" style={{ fontSize:13, color:"#4F8EF7", textDecoration:"none", display:"flex", alignItems:"center" }}>View plans</Link>}
          </div>
        </div>

        {stats ? (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
              {[
                { label:"Total Checks", value:stats.total_checks, color:"#4F8EF7", delay:0 },
                { label:"Avg Score", value:`${stats.avg_score}/100`, color:"#22C55E", delay:100 },
                { label:"Compliant", value:stats.compliant_count, color:"#22C55E", delay:200 },
                { label:"Non-Compliant", value:stats.non_compliant_count, color:"#EF4444", delay:300 },
              ].map((s,i) => (
                <div key={s.label} style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:`all 0.5s ease ${0.2+i*0.1}s` }}>
                  <StatCard {...s} />
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"1.5rem", marginBottom:"2rem" }}>
              <div className="card" style={{ opacity:visible?1:0, transition:"all 0.5s ease 0.5s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
                  <h2 style={{ fontSize:"1rem", fontWeight:600 }}>Recent Checks</h2>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={refreshChecks} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:6, padding:"4px 10px", color:"#64748B", cursor:"pointer", fontSize:11 }}>Refresh</button>
                    <Link href="/compliance" style={{ fontSize:13, color:"#4F8EF7", textDecoration:"none" }}>New check</Link>
                  </div>
                </div>
                {stats.recent_checks.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"3rem", color:"#64748B" }}>
                    <div style={{ fontSize:48, marginBottom:"1rem" }}>🔍</div>
                    <p style={{ marginBottom:"1rem" }}>No checks yet</p>
                    <Link href="/compliance" style={{ color:"#4F8EF7", textDecoration:"none", fontSize:14 }}>Run your first check</Link>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {stats.recent_checks.map((c, i) => (
                      <div key={c.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", background:"#0A1628", borderRadius:10, border:"1px solid rgba(255,255,255,0.04)", opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-20px)", transition:`all 0.4s ease ${0.6+i*0.1}s`, cursor:"pointer" }}
                        onMouseEnter={(e: any)=>e.currentTarget.style.borderColor="rgba(79,142,247,0.3)"}
                        onMouseLeave={(e: any)=>e.currentTarget.style.borderColor="rgba(255,255,255,0.04)"}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:500, color:"#fff", marginBottom:4 }}>{c.ai_system_name}</div>
                          <div style={{ fontSize:12, color:"#64748B" }}>{(c.selected_countries||[]).join(", ")} — {new Date(c.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ fontFamily:"monospace", fontSize:20, fontWeight:700, color:c.overall_score>70?"#22C55E":c.overall_score>40?"#F59E0B":"#EF4444" }}>{c.overall_score??"-"}</div>
                        <span className={c.status==="Compliant"?"badge-compliant":c.status==="Non-Compliant"?"badge-non":"badge-partial"}>{c.status||"Pending"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                <div className="card" style={{ opacity:visible?1:0, transition:"all 0.5s ease 0.6s" }}>
                  <h3 style={{ fontSize:13, color:"#94A3B8", fontWeight:500, marginBottom:"1rem" }}>Compliance Overview</h3>
                  {[
                    { label:"Compliant", count:stats.compliant_count, total:stats.total_checks, color:"#22C55E" },
                    { label:"Partial", count:stats.partial_count, total:stats.total_checks, color:"#F59E0B" },
                    { label:"Non-Compliant", count:stats.non_compliant_count, total:stats.total_checks, color:"#EF4444" },
                  ].map(item => (
                    <div key={item.label} style={{ marginBottom:"0.75rem" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94A3B8", marginBottom:4 }}>
                        <span>{item.label}</span><span style={{ color:item.color, fontWeight:600 }}>{item.count}</span>
                      </div>
                      <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:item.total>0?`${(item.count/item.total)*100}%`:"0%", background:item.color, borderRadius:3, transition:"width 1s ease 0.8s" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ opacity:visible?1:0, transition:"all 0.5s ease 0.7s" }}>
                  <h3 style={{ fontSize:13, color:"#94A3B8", fontWeight:500, marginBottom:"1rem" }}>Quick Actions</h3>
                  {[
                    { label:"Upload Document", href:"/upload", icon:"📄" },
                    { label:"Manual Check", href:"/compliance", icon:"🔍" },
                    { label:"Ask AI", href:"/chat", icon:"💬" },
                    { label:"View Regulations", href:"/regulations", icon:"📋" },
                  ].map(a => (
                    <Link key={a.label} href={a.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, textDecoration:"none", color:"#94A3B8", fontSize:13, marginBottom:4, transition:"all 0.2s" }}
                      onMouseEnter={(e: any)=>{e.currentTarget.style.background="rgba(79,142,247,0.1)";e.currentTarget.style.color="#fff"}}
                      onMouseLeave={(e: any)=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#94A3B8"}}>
                      <span>{a.icon}</span> {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
            {[0,1,2,3].map(i => (
              <div key={i} className="card" style={{ height:100, background:"linear-gradient(90deg,#112240 25%,#1C3461 50%,#112240 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }} />
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}
