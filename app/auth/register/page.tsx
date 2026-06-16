
"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import toast from "react-hot-toast"
import api from "@/lib/api"

const COUNTRIES_LIST = ["India","United States","United Kingdom","European Union","Canada","Australia","Singapore","Brazil","Japan","China","Germany","France","Other"]

export default function RegisterPage() {
  const { login } = useAuth()
  const [step, setStep] = useState("form")
  const [form, setForm] = useState({ email:"", full_name:"", company_name:"", country:"India", password:"" })
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [agree, setAgree] = useState(false)

  const sendOTP = async (e: any) => {
    e.preventDefault()
    if (!agree) { toast.error("Please accept privacy policy"); return }
    if (form.password.length < 8) { toast.error("Password min 8 characters"); return }
    setLoading(true)
    try {
      await api.post("/otp/send", { email: form.email, purpose: "register" })
      setStep("otp")
      toast.success("OTP sent! Check backend console.")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed")
    } finally { setLoading(false) }
  }

  const verifyAndRegister = async () => {
    if (!otp || otp.length !== 6) { toast.error("Enter 6 digit OTP"); return }
    setLoading(true)
    try {
      const res = await api.post("/otp/register", {
        email: form.email,
        otp,
        full_name: form.full_name,
        company_name: form.company_name,
        country: form.country,
        password: form.password
      })
      const { access_token, user } = res.data
      localStorage.setItem("token", access_token)
      localStorage.setItem("user", JSON.stringify(user))
      toast.success("Account created! Welcome to ComplianceAI!")
      window.location.href = "/dashboard"
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Verification failed")
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
          <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>{step==="form" ? "Create account" : "Verify email"}</h1>
          <p style={{ color:"#94A3B8", marginTop:6, fontSize:14 }}>
            {step==="form" ? "Start with 3 free compliance checks" : `Enter OTP sent to ${form.email}`}
          </p>
        </div>

        <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.75rem", backdropFilter:"blur(10px)" }}>
          {step === "form" ? (
            <form onSubmit={sendOTP}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"0.75rem" }}>
                <div><label className="label">Full name *</label><input className="input" type="text" placeholder="John Smith" value={form.full_name} onChange={(e: any)=>setForm({...form,full_name:e.target.value})} required /></div>
                <div><label className="label">Company</label><input className="input" type="text" placeholder="Acme Corp" value={form.company_name} onChange={(e: any)=>setForm({...form,company_name:e.target.value})} /></div>
              </div>
              <div style={{ marginBottom:"0.75rem" }}><label className="label">Email *</label><input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={(e: any)=>setForm({...form,email:e.target.value})} required /></div>
              <div style={{ marginBottom:"0.75rem" }}>
                <label className="label">Country *</label>
                <select className="input" value={form.country} onChange={(e: any)=>setForm({...form,country:e.target.value})} style={{ cursor:"pointer" }}>
                  {COUNTRIES_LIST.map((c: string)=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:"1rem" }}><label className="label">Password *</label><input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e: any)=>setForm({...form,password:e.target.value})} required minLength={8} /></div>

              <div style={{ background:"rgba(79,142,247,0.05)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:10, padding:"0.875rem", marginBottom:"1.25rem", fontSize:12, color:"#94A3B8", lineHeight:1.6 }}>
                🔒 <strong style={{ color:"#4F8EF7" }}>Privacy protected</strong> — Your data is encrypted and never sold. We comply with GDPR, DPDP Act, and global privacy standards.
              </div>

              <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:"1.25rem" }}>
                <input type="checkbox" id="agree" checked={agree} onChange={(e: any)=>setAgree(e.target.checked)} style={{ marginTop:2, cursor:"pointer" }} />
                <label htmlFor="agree" style={{ fontSize:12, color:"#94A3B8", cursor:"pointer", lineHeight:1.5 }}>
                  I agree to the <a href="#" style={{ color:"#4F8EF7" }}>Terms of Service</a> and <a href="#" style={{ color:"#4F8EF7" }}>Privacy Policy</a>
                </label>
              </div>

              <button type="submit" disabled={loading || !agree} style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", opacity:(!agree||loading)?0.6:1 }}>
                {loading ? "Sending OTP..." : "Send verification OTP"}
              </button>
              <p style={{ textAlign:"center", marginTop:"0.75rem", fontSize:11, color:"#64748B" }}>No credit card required. 3 free checks/month.</p>
            </form>
          ) : (
            <div>
              <div style={{ background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:10, padding:"1rem", marginBottom:"1.5rem", fontSize:13, color:"#4F8EF7", textAlign:"center" }}>
                📧 OTP sent to <strong>{form.email}</strong><br/>
                <span style={{ fontSize:11, color:"#64748B" }}>Check backend terminal for OTP in dev mode</span>
              </div>
              <div style={{ marginBottom:"1.5rem" }}>
                <label className="label">Enter 6-digit OTP</label>
                <input className="input" type="text" placeholder="000000" value={otp} onChange={(e: any)=>setOtp(e.target.value)} maxLength={6} style={{ letterSpacing:"0.5rem", fontSize:"1.5rem", textAlign:"center", fontWeight:700 }} />
              </div>
              <button onClick={verifyAndRegister} disabled={loading||otp.length!==6} style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", opacity:(otp.length!==6||loading)?0.6:1, marginBottom:"0.75rem" }}>
                {loading ? "Creating account..." : "Verify & Create Account"}
              </button>
              <button onClick={()=>{setStep("form");setOtp("")}} style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:"transparent", color:"#64748B", cursor:"pointer", fontSize:13 }}>
                Change details
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:14, color:"#64748B" }}>
          Already have account? <Link href="/auth/login" style={{ color:"#4F8EF7", textDecoration:"none", fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
