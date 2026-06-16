
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import api from "@/lib/api"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ full_name:"", company_name:"", country:"", email:"" })
  const [saving, setSaving] = useState(false)
  const [visible, setVisible] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => {
    if (user) {
      setForm({ full_name:user.full_name||"", company_name:user.company_name||"", country:user.country||"India", email:user.email||"" })
      setTimeout(() => setVisible(true), 100)
      api.get("/dashboard/stats").then((r: any) => setStats(r.data)).catch(() => {})
    }
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      await api.put("/auth/profile", form)
      const updated = {...user, ...form}
      localStorage.setItem("user", JSON.stringify(updated))
      toast.success("Profile updated!")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Update failed")
    } finally { setSaving(false) }
  }

  if (loading || !user) return null

  const initials = (user.full_name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2)

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>My Profile</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Manage your account information</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"1.5rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
          <div>
            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", textAlign:"center", backdropFilter:"blur(10px)", marginBottom:"1rem" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", color:"#fff", fontWeight:700, fontSize:28, boxShadow:"0 0 30px rgba(79,142,247,0.4)" }}>{initials}</div>
              <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>{user.full_name}</div>
              <div style={{ fontSize:13, color:"#64748B", marginBottom:"1rem" }}>{user.email}</div>
              <span style={{ fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20, background:"rgba(79,142,247,0.15)", color:"#4F8EF7", textTransform:"uppercase", border:"1px solid rgba(79,142,247,0.3)" }}>{user.plan} Plan</span>
            </div>

            {stats && (
              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.25rem", backdropFilter:"blur(10px)" }}>
                <h3 style={{ fontSize:13, color:"#64748B", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>Stats</h3>
                {[
                  { label:"Total Checks", value:stats.total_checks, color:"#4F8EF7" },
                  { label:"Avg Score", value:`${stats.avg_score}/100`, color:"#22C55E" },
                  { label:"Compliant", value:stats.compliant_count, color:"#22C55E" },
                  { label:"Checks Left", value:stats.checks_remaining, color:stats.checks_remaining===0?"#EF4444":"#F59E0B" },
                ].map((s: any) => (
                  <div key={s.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:13 }}>
                    <span style={{ color:"#94A3B8" }}>{s.label}</span>
                    <span style={{ color:s.color, fontWeight:600, fontFamily:"monospace" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.75rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.5rem", color:"#4F8EF7" }}>Personal Information</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
              <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6, textTransform:"uppercase" }}>Full Name</label><input className="input" value={form.full_name} onChange={(e: any) => setForm({...form, full_name:e.target.value})} /></div>
              <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6, textTransform:"uppercase" }}>Company</label><input className="input" value={form.company_name} onChange={(e: any) => setForm({...form, company_name:e.target.value})} placeholder="Optional" /></div>
            </div>
            <div style={{ marginBottom:"1rem" }}><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6, textTransform:"uppercase" }}>Email</label><input className="input" value={form.email} disabled style={{ opacity:0.5 }} /></div>
            <div style={{ marginBottom:"1.5rem" }}><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6, textTransform:"uppercase" }}>Country</label><input className="input" value={form.country} onChange={(e: any) => setForm({...form, country:e.target.value})} /></div>

            <div style={{ background:"rgba(79,142,247,0.05)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:10, padding:"1rem", marginBottom:"1.5rem", fontSize:12, color:"#94A3B8", lineHeight:1.6 }}>
              🔒 Your personal information is encrypted and never shared with third parties. We comply with GDPR and DPDP Act.
            </div>

            <button onClick={save} disabled={saving} style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", boxShadow:"0 0 20px rgba(79,142,247,0.3)" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
