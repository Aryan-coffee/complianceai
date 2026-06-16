
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"

export default function CustomRegulationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [regs, setRegs] = useState<any[]>([
    { id:1, name:"Internal AI Ethics Policy", rules:"AI systems must be explainable. No black-box decisions for customer-facing products. Bias audit required every 6 months.", active:true },
    { id:2, name:"Data Minimization Policy", rules:"Collect only data necessary for stated purpose. Personal data retention max 2 years. Delete on user request within 30 days.", active:true },
  ])
  const [form, setForm] = useState({ name:"", rules:"" })
  const [adding, setAdding] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const addReg = () => {
    if (!form.name || !form.rules) { toast.error("Fill all fields"); return }
    setRegs(prev => [...prev, { id:Date.now(), name:form.name, rules:form.rules, active:true }])
    setForm({ name:"", rules:"" }); setAdding(false)
    toast.success("Custom regulation added!")
  }

  const deleteReg = (id: number) => {
    setRegs(prev => prev.filter((r: any) => r.id !== id))
    toast.success("Deleted!")
  }

  const toggleReg = (id: number) => {
    setRegs(prev => prev.map((r: any) => r.id === id ? {...r, active:!r.active} : r))
  }

  if (loading || !user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <div>
            <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Custom Regulations</h1>
            <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Add your internal company policies as compliance rules</p>
          </div>
          <button onClick={() => setAdding(!adding)} style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:600 }}>+ Add Policy</button>
        </div>

        {adding && (
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>New Custom Policy</h3>
            <div style={{ marginBottom:"1rem" }}>
              <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6, textTransform:"uppercase" }}>Policy Name</label>
              <input className="input" placeholder="e.g. Internal AI Ethics Policy" value={form.name} onChange={(e: any) => setForm({...form, name:e.target.value})} />
            </div>
            <div style={{ marginBottom:"1.25rem" }}>
              <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6, textTransform:"uppercase" }}>Policy Rules</label>
              <textarea className="input" rows={4} placeholder="Describe your policy rules in detail. These will be used to check AI compliance." value={form.rules} onChange={(e: any) => setForm({...form, rules:e.target.value})} style={{ resize:"vertical" }} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={addReg} style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:600 }}>Save Policy</button>
              <button onClick={() => setAdding(false)} style={{ padding:"10px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:13 }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:12, opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
          {regs.map((reg: any, i: number) => (
            <div key={reg.id} style={{ background:"rgba(17,34,64,0.8)", border:`1px solid ${reg.active?"rgba(79,142,247,0.2)":"rgba(255,255,255,0.04)"}`, borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)", opacity:reg.active?1:0.5, transition:"all 0.3s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:reg.active?"#22C55E":"#64748B", flexShrink:0, animation:reg.active?"shimmer 2s infinite":"none" }} />
                  <h3 style={{ fontSize:"1rem", fontWeight:600 }}>{reg.name}</h3>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => toggleReg(reg.id)} style={{ padding:"5px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:reg.active?"#22C55E":"#64748B", cursor:"pointer", fontSize:12 }}>{reg.active?"Active":"Disabled"}</button>
                  <button onClick={() => deleteReg(reg.id)} style={{ padding:"5px 12px", borderRadius:8, border:"1px solid rgba(239,68,68,0.3)", background:"transparent", color:"#EF4444", cursor:"pointer", fontSize:12 }}>Delete</button>
                </div>
              </div>
              <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.7, margin:0 }}>{reg.rules}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(17,34,64,0.5)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", marginTop:"2rem", opacity:visible?1:0, transition:"all 0.5s ease 0.3s" }}>
          <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"0.75rem", color:"#4F8EF7" }}>How it works</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem" }}>
            {[
              { step:"1", text:"Add your internal AI ethics or data policies" },
              { step:"2", text:"Run compliance check on any AI system" },
              { step:"3", text:"Get results including your custom policies" },
            ].map((s: any) => (
              <div key={s.step} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(79,142,247,0.2)", border:"1px solid rgba(79,142,247,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#4F8EF7", flexShrink:0 }}>{s.step}</div>
                <p style={{ fontSize:13, color:"#94A3B8", margin:0, lineHeight:1.5 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
