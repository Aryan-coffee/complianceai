
"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import api from "@/lib/api"
import Navbar from "@/components/Navbar"

function CountUp({ target, duration=1500, color="#4F8EF7" }: any) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <span style={{ color, fontFamily:"monospace", fontSize:"2.2rem", fontWeight:800 }}>{val}</span>
}

function GaugeMini({ score=0, size=80 }: any) {
  const [anim, setAnim] = useState(0)
  useEffect(() => {
    let s = 0
    const t = setInterval(() => { s+=2; setAnim(s); if(s>=score) { setAnim(score); clearInterval(t) } }, 20)
    return () => clearInterval(t)
  }, [score])
  const color = anim>70?"#22C55E":anim>40?"#F59E0B":"#EF4444"
  const cx=size/2, cy=size/2, r=size*0.35, sw=size*0.07
  const arc = (a1: number,a2: number) => {
    const s=(a1-90)*Math.PI/180, e=(a2-90)*Math.PI/180
    return `M ${cx+r*Math.cos(s)} ${cy+r*Math.sin(s)} A ${r} ${r} 0 ${a2-a1>180?1:0} 1 ${cx+r*Math.cos(e)} ${cy+r*Math.sin(e)}`
  }
  const angle = -135+(anim/100)*270
  const nx = cx+(r*0.75)*Math.cos((angle-90)*Math.PI/180)
  const ny = cy+(r*0.75)*Math.sin((angle-90)*Math.PI/180)
  return (
    <svg width={size} height={size*0.7} viewBox={`0 0 ${size} ${size*0.7}`}>
      <path d={arc(-135,135)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} strokeLinecap="round"/>
      <path d={arc(-135,-135+(anim/100)*270)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={sw*0.5} fill={color}/>
      <text x={cx} y={cy*1.15} textAnchor="middle" fill={color} fontSize={size*0.16} fontWeight="700" fontFamily="monospace">{anim}</text>
    </svg>
  )
}

function BarChart({ data }: any) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { setTimeout(() => setAnim(true), 300) }, [])
  const max = Math.max(...data.map((d: any) => d.value), 1)
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:120, padding:"0 4px" }}>
      {data.map((d: any, i: number) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <span style={{ fontSize:10, color:d.color||"#4F8EF7", fontWeight:600, fontFamily:"monospace" }}>{d.value}</span>
          <div style={{ width:"100%", borderRadius:"4px 4px 0 0", background:`${d.color||"#4F8EF7"}20`, border:`1px solid ${d.color||"#4F8EF7"}40`, position:"relative", overflow:"hidden", height:80 }}>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, background:d.color||"#4F8EF7", borderRadius:"3px 3px 0 0", height:anim?`${(d.value/max)*100}%`:"0%", transition:`height 0.8s ease ${i*0.1}s` }} />
          </div>
          <span style={{ fontSize:9, color:"#64748B", textAlign:"center", lineHeight:1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ compliant=0, partial=0, non=0 }: any) {
  const total = compliant+partial+non||1
  const [anim, setAnim] = useState(false)
  useEffect(() => { setTimeout(() => setAnim(true), 500) }, [])
  const r=45, cx=60, cy=60, circ=2*Math.PI*r
  const c1=circ*(compliant/total), c2=circ*(partial/total), c3=circ*(non/total)
  const off1=0, off2=circ-c1, off3=circ-c1-c2
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={16}/>
        {compliant>0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22C55E" strokeWidth={16} strokeDasharray={`${anim?c1:0} ${circ}`} strokeDashoffset={-off1} strokeLinecap="round" style={{ transition:"stroke-dasharray 1s ease 0.3s", transform:"rotate(-90deg)", transformOrigin:"60px 60px" }}/>}
        {partial>0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F59E0B" strokeWidth={16} strokeDasharray={`${anim?c2:0} ${circ}`} strokeDashoffset={-off2} strokeLinecap="round" style={{ transition:"stroke-dasharray 1s ease 0.5s", transform:"rotate(-90deg)", transformOrigin:"60px 60px" }}/>}
        {non>0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EF4444" strokeWidth={16} strokeDasharray={`${anim?c3:0} ${circ}`} strokeDashoffset={-off3} strokeLinecap="round" style={{ transition:"stroke-dasharray 1s ease 0.7s", transform:"rotate(-90deg)", transformOrigin:"60px 60px" }}/>}
        <text x={cx} y={cy-5} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="700" fontFamily="monospace">{compliant+partial+non}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill="#64748B" fontSize={9}>total</text>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {[["#22C55E","Compliant",compliant],["#F59E0B","Partial",partial],["#EF4444","Non-Compliant",non]].map(([c,l,v]: any) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:c, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:"#94A3B8" }}>{l}</span>
            <span style={{ fontSize:13, fontWeight:700, color:c, fontFamily:"monospace", marginLeft:"auto" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PurchaseModal({ onClose }: any) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div onClick={(e: any)=>e.stopPropagation()} style={{ background:"#112240", border:"1px solid rgba(79,142,247,0.3)", borderRadius:20, padding:"2.5rem", maxWidth:520, width:"100%", position:"relative" }}>
        <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:12, fontWeight:700, padding:"5px 20px", borderRadius:20 }}>Upgrade Required</div>
        <div style={{ textAlign:"center", marginBottom:"1.5rem", marginTop:"0.5rem" }}>
          <div style={{ fontSize:56, marginBottom:"0.75rem" }}>🔒</div>
          <h2 style={{ fontSize:"1.4rem", fontWeight:700, marginBottom:"0.5rem" }}>Free limit reached!</h2>
          <p style={{ color:"#94A3B8", fontSize:14 }}>You have used all 3 free checks this month. Upgrade to continue.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1.5rem" }}>
          {[
            { name:"Starter", price:"$12", inr:"Rs 999/mo", features:["5 countries","20 checks/month","PDF reports"], color:"#4F8EF7" },
            { name:"Pro", price:"$35", inr:"Rs 2,999/mo", features:["All 10 countries","Unlimited checks","Priority support"], color:"#22C55E", popular:true },
          ].map((p: any) => (
            <div key={p.name} style={{ background:"#0A1628", border:p.popular?"2px solid #22C55E":"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"1.25rem", position:"relative" }}>
              {p.popular && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"#22C55E", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 12px", borderRadius:20, whiteSpace:"nowrap" }}>Most popular</div>}
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:"1.8rem", fontWeight:700, color:p.color, fontFamily:"monospace" }}>{p.price}</div>
              <div style={{ fontSize:11, color:"#64748B", marginBottom:"0.75rem" }}>{p.inr}</div>
              {p.features.map((f: string) => (<div key={f} style={{ fontSize:12, color:"#94A3B8", marginBottom:4, display:"flex", gap:6 }}><span style={{ color:"#22C55E" }}>✓</span>{f}</div>))}
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
  const [showPurchase, setShowPurchase] = useState(false)
  const [visible, setVisible] = useState(false)
  const [tab, setTab] = useState("overview")

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading])
  useEffect(() => {
    if (user) {
      api.get("/dashboard/stats").then((r: any) => {
        setStats(r.data)
        setTimeout(() => setVisible(true), 100)
        if (r.data.checks_remaining === 0 && user.plan === "free") setTimeout(() => setShowPurchase(true), 1500)
      }).catch(() => {})
    }
  }, [user])

  if (loading || !user) return null

  const QUICK_ACTIONS = [
    { icon:"🔍", label:"Compliance Check", href:"/compliance", color:"#4F8EF7", desc:"Check AI system compliance" },
    { icon:"📁", label:"Upload Document", href:"/upload", color:"#7C3AED", desc:"Analyze policy documents" },
    { icon:"🏛️", label:"AI Audit", href:"/ai-audit", color:"#22C55E", desc:"Full governance audit" },
    { icon:"📊", label:"Bulk Check", href:"/bulk", color:"#F59E0B", desc:"Check 100+ systems at once" },
    { icon:"💬", label:"AI Chat", href:"/chat", color:"#06B6D4", desc:"Ask compliance questions" },
    { icon:"📅", label:"Calendar", href:"/calendar", color:"#EF4444", desc:"Regulation deadlines" },
  ]

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}}
        @keyframes gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .qa-card:hover{transform:translateY(-4px)!important;border-color:rgba(79,142,247,0.4)!important;}
        .check-row:hover{background:rgba(79,142,247,0.08)!important;border-color:rgba(79,142,247,0.2)!important;}
      `}</style>

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.08) 0%,transparent 70%)", top:-200, right:-200 }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)", bottom:-100, left:-100 }} />
      </div>

      <Navbar />
      {showPurchase && <PurchaseModal onClose={() => setShowPurchase(false)} />}

      <div style={{ maxWidth:1300, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>

        {/* HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem", opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease":"none" }}>
          <div>
            <div style={{ fontSize:12, color:"#4F8EF7", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Welcome back</div>
            <h1 style={{ fontSize:"2rem", fontWeight:800, letterSpacing:"-0.02em", background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{user.full_name}</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{user.company_name || "ComplianceAI Dashboard"} — {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => api.get("/dashboard/stats").then((r: any) => setStats(r.data))} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 16px", color:"#94A3B8", cursor:"pointer", fontSize:13, backdropFilter:"blur(10px)" }}>↻ Refresh</button>
            <Link href="/compliance" style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"10px 20px", borderRadius:10, fontWeight:600, fontSize:14, boxShadow:"0 0 20px rgba(79,142,247,0.3)" }}>+ New Check</Link>
          </div>
        </div>

        {/* PLAN BANNER */}
        <div style={{ background:"linear-gradient(135deg,rgba(79,142,247,0.12),rgba(124,58,237,0.08))", border:"1px solid rgba(79,142,247,0.2)", borderRadius:14, padding:"1rem 1.5rem", marginBottom:"2rem", display:"flex", alignItems:"center", justifyContent:"space-between", backdropFilter:"blur(10px)", opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease 0.1s":"none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#4F8EF7", animation:"shimmer 2s infinite" }} />
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, background:"rgba(79,142,247,0.2)", color:"#4F8EF7", textTransform:"uppercase", letterSpacing:"0.05em" }}>{user.plan}</span>
            <span style={{ fontSize:14, color:"#94A3B8" }}>
              {stats ? (stats.checks_remaining > 0 ? <><strong style={{ color:"#fff" }}>{stats.checks_remaining}</strong> checks remaining this month</> : <span style={{ color:"#EF4444" }}>Monthly limit reached — upgrade to continue</span>) : "Loading..."}
            </span>
          </div>
          {user.plan === "free" && (
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              {stats?.checks_remaining === 0 && <button onClick={() => setShowPurchase(true)} style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", border:"none", borderRadius:8, padding:"8px 16px", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Upgrade now</button>}
              <Link href="/pricing" style={{ fontSize:13, color:"#4F8EF7", textDecoration:"none" }}>View plans →</Link>
            </div>
          )}
        </div>

        {/* STAT CARDS */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
            {[
              { label:"Total Checks", value:stats.total_checks, color:"#4F8EF7", icon:"🔍", delay:0.2 },
              { label:"Average Score", value:stats.avg_score, color:stats.avg_score>70?"#22C55E":stats.avg_score>40?"#F59E0B":"#EF4444", icon:"📊", suffix:"/100", delay:0.3 },
              { label:"Compliant", value:stats.compliant_count, color:"#22C55E", icon:"✅", delay:0.4 },
              { label:"Issues Found", value:stats.non_compliant_count, color:"#EF4444", icon:"⚠️", delay:0.5 },
            ].map((s: any) => (
              <div key={s.label} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)", opacity:visible?1:0, animation:visible?`fadeUp 0.6s ease ${s.delay}s both`:"none", transition:"transform 0.2s", cursor:"default" }}
                onMouseEnter={(e: any)=>e.currentTarget.style.transform="translateY(-4px)"}
                onMouseLeave={(e: any)=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <span style={{ fontSize:13, color:"#94A3B8", fontWeight:500 }}>{s.label}</span>
                  <span style={{ fontSize:20 }}>{s.icon}</span>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <CountUp target={s.value} color={s.color} />
                  {s.suffix && <span style={{ fontSize:14, color:"#64748B" }}>{s.suffix}</span>}
                </div>
                <div style={{ height:3, background:"rgba(255,255,255,0.04)", borderRadius:2, marginTop:12, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(100,(s.value/Math.max(stats.total_checks,1))*100)}%`, background:s.color, borderRadius:2, transition:"width 1.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MAIN GRID */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"1.5rem", marginBottom:"2rem" }}>

          {/* LEFT — RECENT CHECKS */}
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, padding:"1.5rem", backdropFilter:"blur(10px)", opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease 0.6s both":"none" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <h2 style={{ fontSize:"1rem", fontWeight:700 }}>Recent Compliance Checks</h2>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => api.get("/dashboard/stats").then((r: any) => setStats(r.data))} style={{ fontSize:11, color:"#64748B", background:"transparent", border:"1px solid rgba(255,255,255,0.06)", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>↻</button>
                <Link href="/history" style={{ fontSize:13, color:"#4F8EF7", textDecoration:"none" }}>View all →</Link>
              </div>
            </div>
            {!stats || stats.recent_checks.length === 0 ? (
              <div style={{ textAlign:"center", padding:"3rem", color:"#64748B" }}>
                <div style={{ fontSize:56, marginBottom:"1rem" }}>🔍</div>
                <p style={{ marginBottom:"1rem", fontSize:15 }}>No compliance checks yet</p>
                <Link href="/compliance" style={{ color:"#4F8EF7", textDecoration:"none", fontSize:14, fontWeight:500 }}>Run your first check →</Link>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {stats.recent_checks.map((c: any, i: number) => (
                  <div key={c.id} className="check-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"rgba(0,0,0,0.2)", borderRadius:12, border:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", transition:"all 0.2s", opacity:visible?1:0, animation:visible?`fadeUp 0.5s ease ${0.7+i*0.1}s both`:"none" }}>
                    <GaugeMini score={c.overall_score||0} size={64} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:4 }}>{c.ai_system_name}</div>
                      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                        <span className={c.status==="Compliant"?"badge-compliant":c.status==="Non-Compliant"?"badge-non":"badge-partial"}>{c.status||"Pending"}</span>
                        <span style={{ fontSize:11, color:"#64748B" }}>{(c.selected_countries||[]).join(", ")}</span>
                        <span style={{ fontSize:11, color:"#64748B" }}>{new Date(c.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <Link href={`/compliance`} style={{ fontSize:11, color:"#4F8EF7", textDecoration:"none", padding:"5px 10px", border:"1px solid rgba(79,142,247,0.3)", borderRadius:6 }}>Recheck</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

            {/* DONUT CHART */}
            {stats && (
              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, padding:"1.25rem", backdropFilter:"blur(10px)", opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease 0.7s both":"none" }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:"#94A3B8", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>Status Overview</h3>
                <DonutChart compliant={stats.compliant_count} partial={stats.partial_count} non={stats.non_compliant_count} />
              </div>
            )}

            {/* BAR CHART */}
            {stats && stats.country_stats && Object.keys(stats.country_stats).length > 0 && (
              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, padding:"1.25rem", backdropFilter:"blur(10px)", opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease 0.8s both":"none" }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:"#94A3B8", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>Checks by Country</h3>
                <BarChart data={Object.entries(stats.country_stats||{}).slice(0,5).map(([k,v]: any) => ({ label:k, value:v, color:"#4F8EF7" }))} />
              </div>
            )}

            {/* SCORE BREAKDOWN */}
            {stats && (
              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, padding:"1.25rem", backdropFilter:"blur(10px)", opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease 0.9s both":"none" }}>
                <h3 style={{ fontSize:13, fontWeight:600, color:"#94A3B8", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>Score Distribution</h3>
                {[
                  { label:"Compliant (70-100)", count:stats.compliant_count, total:stats.total_checks, color:"#22C55E" },
                  { label:"Partial (40-69)", count:stats.partial_count, total:stats.total_checks, color:"#F59E0B" },
                  { label:"Non-Compliant (0-39)", count:stats.non_compliant_count, total:stats.total_checks, color:"#EF4444" },
                ].map((item: any) => (
                  <div key={item.label} style={{ marginBottom:"0.75rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94A3B8", marginBottom:4 }}>
                      <span>{item.label}</span>
                      <span style={{ color:item.color, fontWeight:600 }}>{item.count}</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:item.total>0?`${(item.count/item.total)*100}%`:"0%", background:item.color, borderRadius:3, transition:"width 1.2s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease 1s both":"none" }}>
          <h2 style={{ fontSize:"1rem", fontWeight:700, marginBottom:"1rem", color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.08em" }}>Quick Actions</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
            {QUICK_ACTIONS.map((a: any, i: number) => (
              <Link key={a.href} href={a.href} className="qa-card" style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem 1rem", textDecoration:"none", textAlign:"center", transition:"all 0.3s", opacity:visible?1:0, animation:visible?`fadeUp 0.5s ease ${1.1+i*0.05}s both`:"none", backdropFilter:"blur(10px)" }}>
                <div style={{ fontSize:28, marginBottom:"0.75rem" }}>{a.icon}</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:4 }}>{a.label}</div>
                <div style={{ fontSize:11, color:"#64748B", lineHeight:1.3 }}>{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
