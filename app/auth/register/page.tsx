
"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import toast from "react-hot-toast"

const COUNTRIES_LIST = ["India","United States","United Kingdom","European Union","Canada","Australia","Singapore","Brazil","Japan","China","Germany","France","Other"]

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ email:"", full_name:"", company_name:"", country:"India", password:"" })
  const [loading, setLoading] = useState<boolean>(false)
  const [agree, setAgree] = useState<boolean>(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!agree) { toast.error("Please accept privacy policy"); return }
    setLoading(true)
    try {
      await register(form)
      toast.success("Account created!")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:"#0A1628", position:"relative", overflow:"hidden" }}>
      <style>{`@keyframes slide-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%)", top:-100, right:-100 }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)", bottom:-100, left:-100 }} />
      </div>

      <div style={{ width:"100%", maxWidth:460, position:"relative", zIndex:1, animation:"slide-up 0.6s ease" }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", color:"#fff", fontWeight:700, fontSize:20, boxShadow:"0 0 30px rgba(79,142,247,0.4)" }}>CA</div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>Create account</h1>
          <p style={{ color:"#94A3B8", marginTop:6, fontSize:14 }}>Start with 3 free compliance checks</p>
        </div>

        <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.75rem", backdropFilter:"blur(10px)" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }}>
              <div><label className="label">Full name</label><input className="input" type="text" placeholder="John Smith" value={form.full_name} onChange={(e: any)=>setForm({...form,full_name:e.target.value})} required /></div>
              <div><label className="label">Company (optional)</label><input className="input" type="text" placeholder="Acme Corp" value={form.company_name} onChange={(e: any)=>setForm({...form,company_name:e.target.value})} /></div>
            </div>
            <div style={{ marginBottom:"0.75rem" }}><label className="label">Email</label><input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={(e: any)=>setForm({...form,email:e.target.value})} required /></div>
            <div style={{ marginBottom:"0.75rem" }}>
              <label className="label">Country</label>
              <select className="input" value={form.country} onChange={(e: any)=>setForm({...form,country:e.target.value})} style={{ cursor:"pointer" }}>
                {COUNTRIES_LIST.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:"1rem" }}><label className="label">Password</label><input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e: any)=>setForm({...form,password:e.target.value})} required minLength={8} /></div>

            <div style={{ background:"rgba(79,142,247,0.05)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:10, padding:"0.875rem", marginBottom:"1.25rem", fontSize:12, color:"#94A3B8", lineHeight:1.6 }}>
              🔒 <strong style={{ color:"#4F8EF7" }}>Privacy protected</strong> — Your personal information is encrypted and never sold. We comply with GDPR, DPDP Act, and global privacy standards.
            </div>

            <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:"1.25rem" }}>
              <input type="checkbox" id="agree" checked={agree} onChange={(e: any)=>setAgree(e.target.checked)} style={{ marginTop:2, cursor:"pointer" }} />
              <label htmlFor="agree" style={{ fontSize:12, color:"#94A3B8", cursor:"pointer", lineHeight:1.5 }}>
                I agree to the <a href="#" style={{ color:"#4F8EF7" }}>Terms of Service</a> and <a href="#" style={{ color:"#4F8EF7" }}>Privacy Policy</a>. My data will be handled securely.
              </label>
            </div>

            <button type="submit" disabled={loading || !agree} style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", opacity:(!agree||loading)?0.6:1 }}>
              {loading ? "Creating account..." : "Create free account"}
            </button>
            <p style={{ textAlign:"center", marginTop:"0.75rem", fontSize:11, color:"#64748B" }}>No credit card required. 3 free checks/month.</p>
          </form>
        </div>

        <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:14, color:"#64748B" }}>
          Already have account? <Link href="/auth/login" style={{ color:"#4F8EF7", textDecoration:"none", fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
