
"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import toast from "react-hot-toast"
import api from "@/lib/api"

export default function LoginPage() {
  const { login } = useAuth()
  const [mode, setMode] = useState("password")
  const [form, setForm] = useState({ email:"", password:"", otp:"" })
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const sendOTP = async () => {
    if (!form.email) { toast.error("Enter your email"); return }
    setLoading(true)
    try {
      await api.post("/otp/send", { email: form.email, purpose: "login" })
      setOtpSent(true)
      toast.success("OTP sent! Check backend console.")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Email not registered")
    } finally { setLoading(false) }
  }

  const loginWithOTP = async () => {
    setLoading(true)
    try {
      const res = await api.post("/otp/verify-login", { email: form.email, otp: form.otp, purpose: "login" })
      const { access_token, user } = res.data
      localStorage.setItem("token", access_token)
      localStorage.setItem("user", JSON.stringify(user))
      window.location.href = "/dashboard"
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid OTP")
    } finally { setLoading(false) }
  }

  const loginWithPassword = async (e: any) => {
    e.preventDefault(); setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success("Welcome back!")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:"#0A1628", position:"relative", overflow:"hidden" }}>
      <style>{`@keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}} @keyframes gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>

      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%)", top:-100, right:-100 }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)", bottom:-100, left:-100 }} />
      </div>

      <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1, animation:"slide-up 0.6s ease" }}>
        <style>{`@keyframes slide-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", color:"#fff", fontWeight:700, fontSize:20, boxShadow:"0 0 30px rgba(79,142,247,0.4)" }}>CA</div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>Sign in</h1>
          <p style={{ color:"#94A3B8", marginTop:6, fontSize:14 }}>Welcome back to ComplianceAI</p>
        </div>

        <div style={{ display:"flex", gap:4, marginBottom:"1.5rem", background:"rgba(17,34,64,0.8)", padding:4, borderRadius:12, border:"1px solid rgba(255,255,255,0.06)", backdropFilter:"blur(10px)" }}>
          <button onClick={()=>{setMode("password");setOtpSent(false)}} style={{ flex:1, padding:"9px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, background:mode==="password"?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent", color:mode==="password"?"#fff":"#94A3B8", transition:"all 0.2s" }}>Password</button>
          <button onClick={()=>setMode("otp")} style={{ flex:1, padding:"9px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, background:mode==="otp"?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent", color:mode==="otp"?"#fff":"#94A3B8", transition:"all 0.2s" }}>Email OTP</button>
        </div>

        <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.75rem", backdropFilter:"blur(10px)" }}>
          {mode==="password" ? (
            <form onSubmit={loginWithPassword}>
              <div style={{ marginBottom:"1rem" }}><label className="label">Email</label><input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={(e: any)=>setForm({...form,email:e.target.value})} required /></div>
              <div style={{ marginBottom:"0.75rem" }}><label className="label">Password</label><input className="input" type="password" placeholder="Your password" value={form.password} onChange={(e: any)=>setForm({...form,password:e.target.value})} required /></div>
              <div style={{ textAlign:"right", marginBottom:"1.5rem" }}>
                <Link href="/auth/forgot-password" style={{ fontSize:12, color:"#4F8EF7", textDecoration:"none" }}>Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", transition:"all 0.2s", opacity:loading?0.7:1 }}>{loading?"Signing in...":"Sign in"}</button>
            </form>
          ) : (
            <div>
              <div style={{ marginBottom:"1rem" }}><label className="label">Email</label><input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={(e: any)=>setForm({...form,email:e.target.value})} /></div>
              {otpSent && (
                <div style={{ marginBottom:"1rem" }}>
                  <div style={{ background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:8, padding:"0.75rem", marginBottom:"0.75rem", fontSize:12, color:"#4F8EF7" }}>OTP sent! Check backend terminal.</div>
                  <label className="label">Enter OTP</label>
                  <input className="input" type="text" placeholder="6 digit OTP" value={form.otp} onChange={(e: any)=>setForm({...form,otp:e.target.value})} maxLength={6} style={{ letterSpacing:"0.3rem", fontSize:"1.2rem", textAlign:"center" }} />
                </div>
              )}
              {!otpSent ? (
                <button onClick={sendOTP} disabled={loading} style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff" }}>{loading?"Sending...":"Send OTP"}</button>
              ) : (
                <button onClick={loginWithOTP} disabled={loading} style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff" }}>{loading?"Verifying...":"Verify & Login"}</button>
              )}
            </div>
          )}
        </div>
        <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:14, color:"#64748B" }}>
          No account? <Link href="/auth/register" style={{ color:"#4F8EF7", textDecoration:"none", fontWeight:500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
