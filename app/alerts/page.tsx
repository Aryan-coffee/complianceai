
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"

const REGULATION_UPDATES = [
  { id:1, date:"2026-06-10", country:"EU", flag:"EU", title:"EU AI Act High-Risk Obligations Live", desc:"High-risk AI systems must now comply with Article 9-15. Conformity assessments mandatory.", impact:"Critical", read:false, color:"#EF4444" },
  { id:2, date:"2026-05-28", country:"India", flag:"IN", title:"DPDP Rules Draft Released", desc:"Ministry of Electronics released draft rules under DPDP Act 2023 for public consultation.", impact:"High", read:false, color:"#F59E0B" },
  { id:3, date:"2026-05-15", country:"USA", flag:"US", title:"NIST AI RMF 2.0 Published", desc:"Updated AI Risk Management Framework with new guidance on generative AI systems.", impact:"Medium", read:true, color:"#4F8EF7" },
  { id:4, date:"2026-04-22", country:"UK", flag:"GB", title:"ICO AI Guidance Updated", desc:"Information Commissioner Office updated AI auditing framework with new requirements.", impact:"Medium", read:true, color:"#22C55E" },
  { id:5, date:"2026-04-10", country:"China", flag:"CN", title:"GenAI Registration Deadline", desc:"All generative AI services must complete CAC registration by April 30, 2026.", impact:"High", read:true, color:"#EF4444" },
]

export default function AlertsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [alerts, setAlerts] = useState(REGULATION_UPDATES)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [countries, setCountries] = useState<string[]>(["EU","India","USA"])
  const [visible, setVisible] = useState(false)
  const COUNTRIES = ["EU","India","USA","UK","Canada","Singapore","Australia","Brazil","China","Japan"]

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const markRead = (id: number) => setAlerts(prev => prev.map((a: any) => a.id === id ? {...a, read:true} : a))
  const markAllRead = () => setAlerts(prev => prev.map((a: any) => ({...a, read:true})))
  const toggle = (list: string[], item: string) => list.includes(item) ? list.filter((i: string) => i !== item) : [...list, item]
  const unread = alerts.filter((a: any) => !a.read).length

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
            <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Regulation Alerts</h1>
            <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Stay updated on AI regulation changes worldwide</p>
          </div>
          {unread > 0 && <button onClick={markAllRead} style={{ padding:"8px 16px", borderRadius:10, border:"1px solid rgba(79,142,247,0.3)", background:"rgba(79,142,247,0.1)", color:"#4F8EF7", cursor:"pointer", fontSize:13 }}>Mark all read ({unread})</button>}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"1.5rem" }}>
          <div>
            {alerts.map((alert: any, i: number) => (
              <div key={alert.id} onClick={() => markRead(alert.id)} style={{ background:alert.read?"rgba(17,34,64,0.5)":"rgba(17,34,64,0.8)", border:`1px solid ${alert.read?"rgba(255,255,255,0.04)":alert.color+"40"}`, borderLeft:`4px solid ${alert.read?"rgba(255,255,255,0.1)":alert.color}`, borderRadius:14, padding:"1.25rem 1.5rem", marginBottom:10, cursor:"pointer", transition:"all 0.2s", opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-20px)", transitionDelay:`${i*0.05}s` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    {!alert.read && <div style={{ width:8, height:8, borderRadius:"50%", background:alert.color, flexShrink:0 }} />}
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:alert.read?"#94A3B8":"#fff" }}>{alert.title}</div>
                      <div style={{ fontSize:12, color:"#64748B" }}>{alert.flag} {alert.country} — {new Date(alert.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:alert.impact==="Critical"?"rgba(239,68,68,0.15)":alert.impact==="High"?"rgba(245,158,11,0.15)":"rgba(79,142,247,0.15)", color:alert.impact==="Critical"?"#EF4444":alert.impact==="High"?"#F59E0B":"#4F8EF7", flexShrink:0 }}>{alert.impact}</span>
                </div>
                <p style={{ fontSize:13, color:alert.read?"#64748B":"#94A3B8", lineHeight:1.6, margin:0 }}>{alert.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.5rem", marginBottom:"1rem", backdropFilter:"blur(10px)" }}>
              <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Email Alerts</h3>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                <span style={{ fontSize:14, color:"#94A3B8" }}>Receive email alerts</span>
                <div onClick={() => { setEmailAlerts(!emailAlerts); toast.success(emailAlerts?"Alerts disabled":"Alerts enabled!") }} style={{ width:44, height:24, borderRadius:12, background:emailAlerts?"#4F8EF7":"rgba(255,255,255,0.1)", cursor:"pointer", position:"relative", transition:"all 0.2s" }}>
                  <div style={{ position:"absolute", top:2, left:emailAlerts?20:2, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"all 0.2s" }} />
                </div>
              </div>
              <p style={{ fontSize:12, color:"#64748B" }}>Alerts will be sent to: <strong style={{ color:"#fff" }}>{user.email}</strong></p>
            </div>

            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
              <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem" }}>Alert Countries</h3>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {COUNTRIES.map((c: string) => (
                  <button key={c} onClick={() => setCountries(toggle(countries,c))} style={{ padding:"5px 12px", borderRadius:20, fontSize:12, cursor:"pointer", background:countries.includes(c)?"rgba(79,142,247,0.2)":"transparent", border:countries.includes(c)?"1px solid #4F8EF7":"1px solid rgba(255,255,255,0.08)", color:countries.includes(c)?"#4F8EF7":"#64748B", transition:"all 0.2s" }}>{c}</button>
                ))}
              </div>
              <button onClick={() => toast.success("Alert preferences saved!")} style={{ width:"100%", marginTop:"1rem", padding:"10px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:500 }}>Save Preferences</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
