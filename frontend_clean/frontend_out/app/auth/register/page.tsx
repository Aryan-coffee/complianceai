"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import toast from "react-hot-toast"
export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ email:"", full_name:"", company_name:"", password:"" })
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success("Account created!")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", background:"#0A1628" }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"#4F8EF7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", color:"#fff", fontWeight:700, fontSize:18 }}>CA</div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700 }}>Create account</h1>
          <p style={{ color:"#94A3B8", marginTop:6, fontSize:14 }}>Start with 3 free compliance checks</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:"1rem" }}>
              <label className="label">Full name</label>
              <input className="input" type="text" placeholder="John Smith" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
            </div>
            <div style={{ marginBottom:"1rem" }}>
              <label className="label">Company (optional)</label>
              <input className="input" type="text" placeholder="Acme Corp" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
            </div>
            <div style={{ marginBottom:"1rem" }}>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={{ marginBottom:"1.5rem" }}>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width:"100%" }}>
              {loading ? "Creating..." : "Create free account"}
            </button>
            <p style={{ textAlign:"center", marginTop:"1rem", fontSize:12, color:"#64748B" }}>No credit card required</p>
          </form>
        </div>
        <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:14, color:"#64748B" }}>
          Already have account? <Link href="/auth/login" style={{ color:"#4F8EF7", textDecoration:"none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
