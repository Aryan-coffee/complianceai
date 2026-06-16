
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"

const ROLES = ["Admin","Editor","Viewer"]

export default function TeamPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<any[]>([
    { id:1, name:"Aryan Dhiman", email:"dhiman@complianceai.in", role:"Admin", status:"active", joined:"2024-01-15", checks:24 },
    { id:2, name:"Priya Sharma", email:"priya@company.com", role:"Editor", status:"active", joined:"2024-02-20", checks:12 },
    { id:3, name:"Rahul Verma", email:"rahul@company.com", role:"Viewer", status:"pending", joined:"2024-03-10", checks:0 },
  ])
  const [invite, setInvite] = useState({ email:"", role:"Viewer" })
  const [showInvite, setShowInvite] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const sendInvite = () => {
    if (!invite.email) { toast.error("Enter email"); return }
    setMembers(prev => [...prev, { id:Date.now(), name:invite.email.split("@")[0], email:invite.email, role:invite.role, status:"pending", joined:new Date().toISOString().split("T")[0], checks:0 }])
    setInvite({ email:"", role:"Viewer" }); setShowInvite(false)
    toast.success(`Invite sent to ${invite.email}!`)
  }

  const removeMember = (id: number) => { setMembers(prev => prev.filter((m: any) => m.id !== id)); toast.success("Member removed") }
  const changeRole = (id: number, role: string) => { setMembers(prev => prev.map((m: any) => m.id === id ? {...m, role} : m)); toast.success("Role updated!") }

  if (loading || !user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <div>
            <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Team</h1>
            <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Manage team members and permissions</p>
          </div>
          <button onClick={() => setShowInvite(true)} style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:600 }}>+ Invite Member</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
          {[
            { label:"Total Members", value:members.length, color:"#4F8EF7" },
            { label:"Active", value:members.filter((m: any) => m.status==="active").length, color:"#22C55E" },
            { label:"Pending", value:members.filter((m: any) => m.status==="pending").length, color:"#F59E0B" },
          ].map((s: any) => (
            <div key={s.label} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem", backdropFilter:"blur(10px)" }}>
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:"2rem", fontWeight:700, fontFamily:"monospace", color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {showInvite && (
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Invite Team Member</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, marginBottom:"1rem" }}>
              <input className="input" type="email" placeholder="colleague@company.com" value={invite.email} onChange={(e: any) => setInvite({...invite, email:e.target.value})} />
              <select className="input" value={invite.role} onChange={(e: any) => setInvite({...invite, role:e.target.value})} style={{ cursor:"pointer", width:140 }}>
                {ROLES.map((r: string) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ background:"rgba(79,142,247,0.05)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:10, padding:"0.875rem", marginBottom:"1rem", fontSize:12, color:"#94A3B8" }}>
              🔒 <strong style={{ color:"#4F8EF7" }}>Admin:</strong> Full access &nbsp;|&nbsp; <strong style={{ color:"#4F8EF7" }}>Editor:</strong> Run checks, view results &nbsp;|&nbsp; <strong style={{ color:"#4F8EF7" }}>Viewer:</strong> View only
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={sendInvite} style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:600 }}>Send Invite</button>
              <button onClick={() => setShowInvite(false)} style={{ padding:"10px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:13 }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, overflow:"hidden", backdropFilter:"blur(10px)", opacity:visible?1:0, transition:"all 0.5s ease 0.2s" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto", gap:"1rem", padding:"1rem 1.5rem", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:11, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.06em" }}>
            <span>Member</span><span>Role</span><span>Checks</span><span>Status</span><span></span>
          </div>
          {members.map((m: any, i: number) => (
            <div key={m.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto", gap:"1rem", padding:"1rem 1.5rem", borderBottom:"1px solid rgba(255,255,255,0.04)", alignItems:"center", opacity:visible?1:0, transition:`all 0.4s ease ${i*0.05}s` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>{m.name[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:500 }}>{m.name}</div>
                  <div style={{ fontSize:12, color:"#64748B" }}>{m.email}</div>
                </div>
              </div>
              <select value={m.role} onChange={(e: any) => changeRole(m.id, e.target.value)} style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"5px 10px", color:m.role==="Admin"?"#4F8EF7":m.role==="Editor"?"#22C55E":"#94A3B8", fontSize:12, cursor:"pointer" }}>
                {ROLES.map((r: string) => <option key={r} value={r}>{r}</option>)}
              </select>
              <span style={{ fontSize:14, fontFamily:"monospace", color:"#4F8EF7" }}>{m.checks}</span>
              <span style={{ fontSize:12, padding:"4px 10px", borderRadius:20, background:m.status==="active"?"rgba(34,197,94,0.15)":"rgba(245,158,11,0.15)", color:m.status==="active"?"#22C55E":"#F59E0B", width:"fit-content" }}>{m.status}</span>
              {m.role !== "Admin" && <button onClick={() => removeMember(m.id)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid rgba(239,68,68,0.3)", background:"transparent", color:"#EF4444", cursor:"pointer", fontSize:12 }}>Remove</button>}
              {m.role === "Admin" && <div style={{ width:60 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
