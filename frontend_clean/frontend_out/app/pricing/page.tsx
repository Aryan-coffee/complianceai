"use client"
import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { paymentAPI } from "@/lib/api"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
const PLANS = [
  { name:"Free", price:"$0", inr:"Rs 0/mo", plan:"free", featured:false, features:["1 country per check","3 checks/month","Basic report"], missing:["PDF download","Multi-country","API access"] },
  { name:"Starter", price:"$12", inr:"Rs 999/mo", plan:"starter", featured:false, features:["5 countries","20 checks/month","PDF reports","Email support"], missing:["Unlimited checks","API access"] },
  { name:"Pro", price:"$35", inr:"Rs 2999/mo", plan:"pro", featured:true, features:["All 10 countries","Unlimited checks","Detailed PDF","Priority support","Auto-updates"], missing:["API access"] },
  { name:"Enterprise", price:"Custom", inr:"Contact us", plan:"enterprise", featured:false, features:["Everything in Pro","API access","White-label","SLA guarantee","Dedicated support"], missing:[] },
]
declare global { interface Window { Razorpay: any } }
export default function PricingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string|null>(null)
  const handleUpgrade = async (plan: string) => {
    if (!user) { window.location.href = "/auth/register"; return }
    if (plan === "enterprise") { toast("Contact: contact@complianceai.in"); return }
    if (plan === "free") return
    setLoading(plan)
    try {
      const res = await paymentAPI.createOrder({ plan })
      const order = res.data
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      document.body.appendChild(script)
      script.onload = () => {
        const rzp = new window.Razorpay({ key: order.key_id, amount: order.amount, currency: order.currency, name: "ComplianceAI", description: plan + " Plan", order_id: order.order_id,
          handler: async (response: any) => {
            try { await paymentAPI.verify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, plan }); toast.success("Upgraded to " + plan); window.location.href = "/dashboard" } catch { toast.error("Verification failed") }
          }, prefill: { email: user.email, name: user.full_name }, theme: { color: "#4F8EF7" }
        })
        rzp.open()
      }
    } catch (err: any) { toast.error(err.response?.data?.detail || "Payment failed") } finally { setLoading(null) }
  }
  return (
    <div style={{ minHeight:"100vh", background:"#0A1628" }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"8rem 2rem 4rem" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <h1 style={{ fontSize:"2.5rem", fontWeight:700, marginBottom:"1rem" }}>Simple, transparent pricing</h1>
          <p style={{ color:"#94A3B8" }}>One lawyer hour costs more than a year of ComplianceAI Pro.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.5rem", alignItems:"start" }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background:"#112240", border: p.featured ? "2px solid #4F8EF7" : "1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"1.75rem", position:"relative" }}>
              {p.featured && <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:"#4F8EF7", color:"#fff", fontSize:11, fontWeight:700, padding:"3px 18px", borderRadius:20, whiteSpace:"nowrap" }}>Most popular</div>}
              <div style={{ fontSize:14, fontWeight:500, color:"#94A3B8", marginBottom:"0.75rem" }}>{p.name}</div>
              <div style={{ fontFamily:"monospace", fontSize:"2.2rem", fontWeight:700, lineHeight:1 }}>{p.price}</div>
              <div style={{ fontSize:13, color:"#64748B", marginTop:4 }}>{p.inr}</div>
              <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.06)", margin:"1.25rem 0" }} />
              <ul style={{ listStyle:"none", marginBottom:"1.5rem" }}>
                {p.features.map(f => <li key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#94A3B8", marginBottom:10 }}><span style={{ color:"#22C55E", flexShrink:0 }}>ok</span>{f}</li>)}
                {p.missing.map(f => <li key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#475569", marginBottom:10 }}><span>-</span>{f}</li>)}
              </ul>
              <button onClick={() => handleUpgrade(p.plan)} disabled={loading === p.plan || user?.plan === p.plan} style={{ width:"100%", padding:"12px", borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer", background: p.featured ? "#4F8EF7" : "transparent", color: p.featured ? "#fff" : "#94A3B8", border: p.featured ? "none" : "1px solid rgba(255,255,255,0.1)", opacity: user?.plan === p.plan ? 0.5 : 1 }}>
                {loading === p.plan ? "Processing..." : user?.plan === p.plan ? "Current plan" : p.plan === "free" ? "Start free" : p.plan === "enterprise" ? "Contact us" : "Upgrade to " + p.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
