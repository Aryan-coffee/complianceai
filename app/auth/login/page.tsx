
"use client"
import { useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import api from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const sendOTP = async () => {
    if (!email) { toast.error("Enter your email"); return }
    setLoading(true)
    try {
      await api.post("/otp/send", { email, purpose: "login" })
      setOtpSent(true)
      toast.success("OTP sent to your email!")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Email not registered")
    } finally { setLoading(false) }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) { toast.error("Enter 6 digit OTP"); return }
    setLoading(true)
    try {
      const res = await api.post("/otp/verify-login", { email, otp, purpose: "login" })
      const { access_token, user } = res.data
      localStorage.setItem("token", access_token)
      localStorage.setItem("user", JSON.stringify(user))
      toast.success("Welcome back!")
      window.location.href = "/dashboard"
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid OTP")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:"#0A1628", position:"relative", overflow:"hidden" }}>
      <style>{`@keyframes slide-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}} @keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}}`}</style>

      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.12) 0%,transparent 70%)", top:-100, right:-100 }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)", bottom:-100, left:-100 }} />
      </div>

      <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1, animation:"slide-up 0.6s ease" }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", color:"#fff", fontWeight:700, fontSize:20, boxShadow:"0 0 30px rgba(79,142,247,0.4)" }}>CA</div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>Sign in</h1>
          <p style={{ color:"#94A3B8", marginTop:6, fontSize:14 }}>Enter your email to receive a login OTP</p>
        </div>

        <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"2rem", backdropFilter:"blur(10px)" }}>
          {!otpSent ? (
            <div>
              <div style={{ marginBottom:"1.5rem" }}>
                <label className="label">Email address</label>
                <input className="input" type="email" placeholder="you@company.com" value={email} onChange={(e: any)=>setEmail(e.target.value)} onKeyDown={(e: any)=>e.key==="Enter"&&sendOTP()} autoFocus />
              </div>
              <button onClick={sendOTP} disabled={loading||!email} style={{ width:"100%", padding:"14px", borderRadius:10, border:"none", cursor:"pointer", fontSize:15, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", opacity:(!email||loading)?0.6:1, boxShadow:"0 0 20px rgba(79,142,247,0.3)", transition:"all 0.2s" }}>
                {loading ? "Sending OTP..." : "Send OTP to Email"}
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:"1.5rem" }}>
                <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
                <span style={{ fontSize:11, color:"#64748B" }}>Secure OTP login</span>
                <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:"1.5rem", marginTop:"1rem" }}>
                {["🔒 No password needed","📧 OTP via email","⚡ 10 min expiry"].map((t: string) => (
                  <span key={t} style={{ fontSize:11, color:"#64748B" }}>{t}</span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:10, padding:"1rem", marginBottom:"1.5rem", textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:"0.5rem" }}>📧</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:4 }}>OTP sent!</div>
                <div style={{ fontSize:13, color:"#94A3B8" }}>Check your email: <strong style={{ color:"#4F8EF7" }}>{email}</strong></div>
              </div>
              <div style={{ marginBottom:"1.5rem" }}>
                <label className="label">Enter 6-digit OTP</label>
                <input className="input" type="text" placeholder="000000" value={otp} onChange={(e: any)=>setOtp(e.target.value.replace(/[^0-9]/g,""))} maxLength={6} style={{ letterSpacing:"0.5rem", fontSize:"1.8rem", textAlign:"center", fontWeight:700 }} onKeyDown={(e: any)=>e.key==="Enter"&&verifyOTP()} autoFocus />
              </div>
              <button onClick={verifyOTP} disabled={loading||otp.length!==6} style={{ width:"100%", padding:"14px", borderRadius:10, border:"none", cursor:"pointer", fontSize:15, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", opacity:(otp.length!==6||loading)?0.6:1, boxShadow:"0 0 20px rgba(79,142,247,0.3)", marginBottom:"0.75rem" }}>
                {loading ? "Verifying..." : "Verify OTP & Sign In"}
              </button>
              <button onClick={()=>{setOtpSent(false);setOtp("")}} style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:"transparent", color:"#64748B", cursor:"pointer", fontSize:13 }}>
                Use different email
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign:"center", marginTop:"1.5rem" }}>
          <p style={{ fontSize:14, color:"#64748B", marginBottom:"0.5rem" }}>
            No account? <Link href="/auth/register" style={{ color:"#4F8EF7", textDecoration:"none", fontWeight:500 }}>Create one free</Link>
          </p>
          <Link href="/auth/forgot-password" style={{ fontSize:13, color:"#64748B", textDecoration:"none" }}>Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}
