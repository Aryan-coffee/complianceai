"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import toast from "react-hot-toast"
export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success("Welcome back!")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:"#0A1628" }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"#4F8EF7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", color:"#fff", fontWeight:700, fontSize:18 }}>CA</div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>Sign in</h1>
          <p style={{ color:"#94A3B8", marginTop:6, fontSize:14 }}>Welcome back to ComplianceAI</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:"1rem" }}>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={{ marginBottom:"1.5rem" }}>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width:"100%" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
        <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:14, color:"#64748B" }}>
          No account? <Link href="/auth/register" style={{ color:"#4F8EF7", textDecoration:"none" }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
