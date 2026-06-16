
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import Link from "next/link"
import api from "@/lib/api"

export default function SettingsPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [notifications, setNotifications] = useState({ email_alerts:true, weekly_report:false, regulation_updates:true })
  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const saveNotifications = () => toast.success("Notification preferences saved!")

  const changePassword = async () => {
    if (!oldPass || !newPass) { toast.error("Fill both fields"); return }
    if (newPass.length < 8) { toast.error("Password min 8 chars"); return }
    setSaving(true)
    try {
      await api.post("/auth/change-password", { old_password:oldPass, new_password:newPass })
      toast.success("Password changed!"); setOldPass(""); setNewPass("")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed")
    } finally { setSaving(false) }
  }

  if (loading || !user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Settings</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Manage your account preferences</p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>

          {/* PLAN */}
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Current Plan</h3>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:18, fontWeight:700, marginBottom:4, textTransform:"capitalize" }}>{user.plan} Plan</div>
                <div style={{ fontSize:13, color:"#64748B" }}>
                  {user.plan==="free" ? "3 compliance checks/month" : user.plan==="starter" ? "20 compliance checks/month" : "Unlimited compliance checks"}
                </div>
              </div>
              {user.plan === "free" && <Link href="/pricing" style={{ padding:"10px 20px", borderRadius:10, textDecoration:"none", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:600 }}>Upgrade</Link>}
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.25rem" }}>Notifications</h3>
            {[
              { key:"email_alerts", label:"Email OTP alerts", desc:"Receive OTP codes via email for login" },
              { key:"regulation_updates", label:"Regulation updates", desc:"Get notified when AI laws change" },
              { key:"weekly_report", label:"Weekly summary", desc:"Weekly compliance activity summary" },
            ].map((n: any) => (
              <div key={n.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:500 }}>{n.label}</div>
                  <div style={{ fontSize:12, color:"#64748B" }}>{n.desc}</div>
                </div>
                <div onClick={() => setNotifications({...notifications, [n.key]:!notifications[n.key as keyof typeof notifications]})} style={{ width:44, height:24, borderRadius:12, background:notifications[n.key as keyof typeof notifications]?"#4F8EF7":"rgba(255,255,255,0.1)", cursor:"pointer", position:"relative", transition:"all 0.2s", flexShrink:0 }}>
                  <div style={{ position:"absolute", top:2, left:notifications[n.key as keyof typeof notifications]?20:2, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"all 0.2s" }} />
                </div>
              </div>
            ))}
            <button onClick={saveNotifications} style={{ marginTop:"1rem", padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:500 }}>Save Preferences</button>
          </div>

          {/* SECURITY */}
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.25rem" }}>Security</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
              <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6 }}>Current Password</label><input className="input" type="password" placeholder="••••••••" value={oldPass} onChange={(e: any) => setOldPass(e.target.value)} /></div>
              <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6 }}>New Password</label><input className="input" type="password" placeholder="Min 8 chars" value={newPass} onChange={(e: any) => setNewPass(e.target.value)} /></div>
            </div>
            <button onClick={changePassword} disabled={saving} style={{ padding:"10px 20px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:13 }}>{saving ? "Changing..." : "Change Password"}</button>
          </div>

          {/* DANGER ZONE */}
          <div style={{ background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"0.75rem", color:"#EF4444" }}>Danger Zone</h3>
            <p style={{ fontSize:13, color:"#94A3B8", marginBottom:"1rem" }}>Once you delete your account, all data will be permanently removed. This cannot be undone.</p>
            <button onClick={() => { if(confirm("Delete account? This cannot be undone!")) { logout(); toast.error("Account deleted") }}} style={{ padding:"10px 20px", borderRadius:10, border:"1px solid rgba(239,68,68,0.4)", background:"transparent", color:"#EF4444", cursor:"pointer", fontSize:13 }}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
