
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import Link from "next/link"

export default function ClientPortalPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([
    { id:1, name:"TechCorp India", email:"legal@techcorp.in", industry:"FinTech", checks:8, lastCheck:"2026-06-10", avgScore:72, status:"active" },
    { id:2, name:"HealthAI Solutions", email:"cto@healthai.com", industry:"Healthcare", checks:5, lastCheck:"2026-06-05", avgScore:45, status:"active" },
    { id:3, name:"EduBot Academy", email:"compliance@edubot.edu", industry:"Education", checks:3, lastCheck:"2026-05-28", avgScore:88, status:"active" },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:"", email:"", industry:"" })
  const [visible, setVisible] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const addClient = () => {
    if (!form.name || !form.email) { toast.error("Fill all fields"); return }
    setClients(prev => [...prev, { id:Date.now(), ...form, checks:0, lastCheck:"-", avgScore:0, status:"active" }])
    setForm({ name:"", email:"", industry:"" }); setShowAdd(false)
    toast.success("Client added!")
  }

  if (loading || !user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <div>
            <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Client Portal</h1>
            <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Manage compliance checks for your clients</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:600 }}>+ Add Client</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
          {[
            { label:"Total Clients", value:clients.length, color:"#4F8EF7" },
            { label:"Total Checks", value:clients.reduce((a: number, c: any) => a+c.checks, 0), color:"#22C55E" },
            { label:"Avg Score", value:Math.round(clients.reduce((a: number, c: any) => a+c.avgScore, 0)/clients.length)||0, color:"#F59E0B" },
            { label:"Active", value:clients.filter((c: any) => c.status==="active").length, color:"#22C55E" },
          ].map((s: any) => (
            <div key={s.label} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem", backdropFilter:"blur(10px)" }}>
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:"2rem", fontWeight:700, fontFamily:"monospace", color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {showAdd && (
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Add New Client</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:"1rem" }}>
              <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:4 }}>Company Name</label><input className="input" placeholder="TechCorp India" value={form.name} onChange={(e: any) => setForm({...form, name:e.target.value})} /></div>
              <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:4 }}>Email</label><input className="input" type="email" placeholder="legal@techcorp.in" value={form.email} onChange={(e: any) => setForm({...form, email:e.target.value})} /></div>
              <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:4 }}>Industry</label><input className="input" placeholder="FinTech, Healthcare..." value={form.industry} onChange={(e: any) => setForm({...form, industry:e.target.value})} /></div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={addClient} style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:600 }}>Add Client</button>
              <button onClick={() => setShowAdd(false)} style={{ padding:"10px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:13 }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", opacity:visible?1:0, transition:"all 0.5s ease 0.2s" }}>
          {clients.map((c: any, i: number) => (
            <div key={c.id} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:`all 0.4s ease ${i*0.1}s` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,rgba(79,142,247,0.3),rgba(124,58,237,0.3))", display:"flex", alignItems:"center", justifyContent:"center", color:"#4F8EF7", fontWeight:700, fontSize:18, border:"1px solid rgba(79,142,247,0.3)" }}>{c.name[0]}</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:600 }}>{c.name}</div>
                  <div style={{ fontSize:12, color:"#64748B" }}>{c.industry}</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:"1rem" }}>
                <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"0.75rem", textAlign:"center" }}>
                  <div style={{ fontSize:"1.5rem", fontWeight:700, fontFamily:"monospace", color:c.avgScore>70?"#22C55E":c.avgScore>40?"#F59E0B":"#EF4444" }}>{c.avgScore}</div>
                  <div style={{ fontSize:11, color:"#64748B" }}>Avg Score</div>
                </div>
                <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"0.75rem", textAlign:"center" }}>
                  <div style={{ fontSize:"1.5rem", fontWeight:700, fontFamily:"monospace", color:"#4F8EF7" }}>{c.checks}</div>
                  <div style={{ fontSize:11, color:"#64748B" }}>Checks</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:"1rem" }}>Last check: {c.lastCheck}</div>
              <div style={{ display:"flex", gap:8 }}>
                <Link href="/compliance" style={{ flex:1, padding:"9px", borderRadius:8, textDecoration:"none", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:12, fontWeight:500, textAlign:"center" }}>New Check</Link>
                <Link href="/history" style={{ flex:1, padding:"9px", borderRadius:8, textDecoration:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", fontSize:12, textAlign:"center" }}>History</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
