
"use client"
import { useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import api from "@/lib/api"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const sendOTP = async () => {
    if (!email) { toast.error("Enter your email"); return }
    setLoading(true)
    try {
      await api.post("/otp/send", { email, purpose: "reset" })
      setStep("otp")
      toast.success("OTP sent! Check backend console for OTP.")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Email not found")
    } finally { setLoading(false) }
  }

  const resetPassword = async () => {
    if (!otp || !password) { toast.error("Fill all fields"); return }
    if (password.length < 8) { toast.error("Password min 8 characters"); return }
    setLoading(true)
    try {
      await api.post("/otp/reset-password", { email, otp, new_password: password })
      setStep("done")
      toast.success("Password reset!")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Reset failed")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:"#0A1628" }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"#4F8EF7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", color:"#fff", fontWeight:700, fontSize:18 }}>CA</div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>{step==="done" ? "Password Reset!" : "Forgot Password"}</h1>
          <p style={{ color:"#94A3B8", marginTop:6, fontSize:14 }}>
            {step==="email" ? "Enter your email to receive OTP" : step==="otp" ? "Enter OTP and new password" : "Login with your new password"}
          </p>
        </div>
        {step==="done" ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:64, marginBottom:"1.5rem" }}>✅</div>
            <Link href="/auth/login" className="btn-primary" style={{ display:"inline-block", textDecoration:"none", padding:"14px 32px" }}>Sign in now</Link>
          </div>
        ) : (
          <div className="card">
            {step==="email" && (
              <>
                <div style={{ marginBottom:"1.5rem" }}>
                  <label className="label">Email address</label>
                  <input className="input" type="email" placeholder="you@company.com" value={email} onChange={(e: any)=>setEmail(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={sendOTP} disabled={loading} style={{ width:"100%" }}>{loading ? "Sending OTP..." : "Send OTP"}</button>
              </>
            )}
            {step==="otp" && (
              <>
                <div style={{ background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:10, padding:"0.75rem 1rem", marginBottom:"1.5rem", fontSize:13, color:"#4F8EF7" }}>
                  OTP sent to {email}. Check backend terminal for OTP code.
                </div>
                <div style={{ marginBottom:"1rem" }}>
                  <label className="label">Enter OTP</label>
                  <input className="input" type="text" placeholder="6 digit OTP" value={otp} onChange={(e: any)=>setOtp(e.target.value)} maxLength={6} style={{ letterSpacing:"0.3rem", fontSize:"1.2rem", textAlign:"center" }} />
                </div>
                <div style={{ marginBottom:"1.5rem" }}>
                  <label className="label">New Password</label>
                  <input className="input" type="password" placeholder="Min 8 characters" value={password} onChange={(e: any)=>setPassword(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={resetPassword} disabled={loading} style={{ width:"100%", marginBottom:"0.75rem" }}>{loading ? "Resetting..." : "Reset Password"}</button>
                <button onClick={()=>setStep("email")} style={{ width:"100%", background:"transparent", border:"none", color:"#64748B", cursor:"pointer", fontSize:13 }}>Change email</button>
              </>
            )}
          </div>
        )}
        <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:14, color:"#64748B" }}>
          Remember password? <Link href="/auth/login" style={{ color:"#4F8EF7", textDecoration:"none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
