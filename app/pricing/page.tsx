
"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import Link from "next/link"

const PLANS = [
  { name:"Free", price:"$0", inr:"Rs 0/mo", plan:"free", color:"#64748B",
    features:["1 country per check","3 checks/month","Basic report","Community support"],
    missing:["PDF download","Multi-country","API access","AI Audit"] },
  { name:"Starter", price:"$12", inr:"Rs 999/mo", plan:"starter", color:"#4F8EF7",
    features:["5 countries per check","20 checks/month","PDF reports","Email support","Regulation updates","AI Audit"],
    missing:["Unlimited checks","API access"] },
  { name:"Pro", price:"$35", inr:"Rs 2,999/mo", plan:"pro", color:"#22C55E", featured:true,
    features:["All 10 countries","Unlimited checks","Detailed PDF reports","Priority support","Auto regulation updates","Document upload","AI Audit","Team access"],
    missing:[] },
  { name:"Enterprise", price:"Custom", inr:"Contact us", plan:"enterprise", color:"#7C3AED",
    features:["Everything in Pro","REST API access","White-label option","SLA guarantee","Dedicated support","Custom regulations"],
    missing:[] },
]

declare global { interface Window { Razorpay: any } }

export default function PricingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string|null>(null)
  const [visible, setVisible] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState<any>(null)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const handlePlanClick = (plan: string) => {
    if (plan === "free") {
      if (!user) { window.location.href = "/auth/register"; return }
      setShowUpgradeModal(true)
      return
    }
    if (plan === "enterprise") { toast("Contact: contact@complianceai.in"); return }
    if (!user) { window.location.href = "/auth/register"; return }
    setShowPaymentModal(plan)
  }

  const processPayment = async (plan: string, method: string) => {
    setLoading(plan)
    try {
      if (method === "razorpay") {
        const res = await fetch("/api/v1/payments/create-order", {
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":`Bearer ${localStorage.getItem("token")}`},
          body: JSON.stringify({ plan })
        })
        const order = await res.json()
        if (!res.ok) throw new Error(order.detail || "Payment failed")
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        document.body.appendChild(script)
        script.onload = () => {
          const rzp = new window.Razorpay({
            key: order.key_id,
            amount: order.amount,
            currency: order.currency,
            name: "ComplianceAI",
            description: plan + " Plan",
            order_id: order.order_id,
            handler: async (response: any) => {
              try {
                await fetch("/api/v1/payments/verify", {
                  method:"POST",
                  headers:{"Content-Type":"application/json","Authorization":`Bearer ${localStorage.getItem("token")}`},
                  body: JSON.stringify({...response, plan})
                })
                toast.success("Upgraded to " + plan + "!")
                setShowPaymentModal(null)
                window.location.href = "/dashboard"
              } catch { toast.error("Verification failed") }
            },
            prefill:{email:user?.email, name:user?.full_name},
            theme:{color:"#4F8EF7"}
          })
          rzp.open()
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed")
    } finally { setLoading(null) }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-200, right:-200 }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)", bottom:-100, left:-100 }} />
      </div>
      <Navbar />

      {/* UPGRADE FROM FREE MODAL */}
      {showUpgradeModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", backdropFilter:"blur(4px)" }} onClick={() => setShowUpgradeModal(false)}>
          <div onClick={(e: any) => e.stopPropagation()} style={{ background:"#112240", border:"1px solid rgba(79,142,247,0.3)", borderRadius:20, padding:"2.5rem", maxWidth:480, width:"100%" }}>
            <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
              <div style={{ fontSize:48, marginBottom:"0.75rem" }}>🚀</div>
              <h2 style={{ fontSize:"1.4rem", fontWeight:700, marginBottom:"0.5rem" }}>Upgrade your plan</h2>
              <p style={{ color:"#94A3B8", fontSize:14 }}>You are on the Free plan. Upgrade to unlock more features.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:"1.5rem" }}>
              {PLANS.filter((p: any) => p.plan !== "free").map((p: any) => (
                <div key={p.plan} onClick={() => { setShowUpgradeModal(false); handlePlanClick(p.plan) }} style={{ display:"flex", alignItems:"center", gap:16, padding:"1rem 1.25rem", borderRadius:12, border:`1px solid ${p.plan==="pro"?"#22C55E":"rgba(255,255,255,0.08)"}`, background:p.plan==="pro"?"rgba(34,197,94,0.08)":"rgba(0,0,0,0.2)", cursor:"pointer", transition:"all 0.2s" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:"#64748B" }}>{p.features[0]}, {p.features[1]}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"1.3rem", fontWeight:700, color:p.color, fontFamily:"monospace" }}>{p.price}</div>
                    <div style={{ fontSize:11, color:"#64748B" }}>{p.inr}</div>
                  </div>
                  {p.plan === "pro" && <span style={{ fontSize:10, background:"#22C55E", color:"#fff", padding:"2px 8px", borderRadius:10, fontWeight:700 }}>Popular</span>}
                </div>
              ))}
            </div>
            <button onClick={() => setShowUpgradeModal(false)} style={{ width:"100%", padding:"10px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#64748B", cursor:"pointer", fontSize:13 }}>Stay on Free plan</button>
          </div>
        </div>
      )}

      {/* PAYMENT METHOD MODAL */}
      {showPaymentModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", backdropFilter:"blur(4px)" }} onClick={() => setShowPaymentModal(null)}>
          <div onClick={(e: any) => e.stopPropagation()} style={{ background:"#112240", border:"1px solid rgba(79,142,247,0.3)", borderRadius:20, padding:"2.5rem", maxWidth:480, width:"100%" }}>
            <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
              <div style={{ fontSize:48, marginBottom:"0.75rem" }}>💳</div>
              <h2 style={{ fontSize:"1.4rem", fontWeight:700, marginBottom:"0.5rem" }}>Choose Payment Method</h2>
              <p style={{ color:"#94A3B8", fontSize:14 }}>Upgrading to <strong style={{ color:"#4F8EF7" }}>{showPaymentModal}</strong> plan</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:"1.5rem" }}>
              {[
                { id:"razorpay", icon:"💳", label:"Credit / Debit Card", desc:"Visa, Mastercard, Rupay, UPI, Net Banking", color:"#4F8EF7" },
                { id:"upi", icon:"📱", label:"UPI Payment", desc:"GPay, PhonePe, Paytm, BHIM", color:"#22C55E" },
                { id:"paypal", icon:"🌐", label:"PayPal", desc:"International payments", color:"#F59E0B" },
              ].map((m: any) => (
                <button key={m.id} onClick={() => processPayment(showPaymentModal, "razorpay")} disabled={loading === showPaymentModal} style={{ display:"flex", alignItems:"center", gap:14, padding:"1rem 1.25rem", borderRadius:12, border:`1px solid rgba(255,255,255,0.08)`, background:"rgba(0,0,0,0.2)", cursor:"pointer", transition:"all 0.2s", textAlign:"left", width:"100%" }}>
                  <span style={{ fontSize:28 }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:2 }}>{m.label}</div>
                    <div style={{ fontSize:12, color:"#64748B" }}>{m.desc}</div>
                  </div>
                  <span style={{ fontSize:18, color:m.color }}>→</span>
                </button>
              ))}
            </div>
            <div style={{ background:"rgba(79,142,247,0.05)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:10, padding:"0.875rem", marginBottom:"1rem", fontSize:12, color:"#94A3B8", textAlign:"center" }}>
              🔒 Secure payment powered by Razorpay. 256-bit SSL encrypted.
            </div>
            <button onClick={() => setShowPaymentModal(null)} style={{ width:"100%", padding:"10px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#64748B", cursor:"pointer", fontSize:13 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"8rem 2rem 4rem", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:"3rem", opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease":"none" }}>
          <div style={{ fontFamily:"monospace", fontSize:11, color:"#4F8EF7", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>Pricing</div>
          <h1 style={{ fontSize:"clamp(2rem,4vw,2.8rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:"1rem", background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Fraction of the cost. All the coverage.</h1>
          <p style={{ color:"#94A3B8", fontSize:"1rem", maxWidth:500, margin:"0 auto" }}>One lawyer hour costs more than a year of ComplianceAI Pro.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.5rem", alignItems:"start" }}>
          {PLANS.map((p: any, i: number) => (
            <div key={p.name} style={{ background:p.featured?"linear-gradient(135deg,rgba(79,142,247,0.12),rgba(124,58,237,0.08))":"rgba(17,34,64,0.8)", border:p.featured?"2px solid #4F8EF7":"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"1.75rem", position:"relative", backdropFilter:"blur(10px)", opacity:visible?1:0, animation:visible?`fadeUp 0.6s ease ${i*0.1}s both`:"none", boxShadow:p.featured?"0 0 40px rgba(79,142,247,0.15)":"none" }}>
              {p.featured && <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 18px", borderRadius:20, whiteSpace:"nowrap" }}>Most popular</div>}
              <div style={{ fontSize:14, fontWeight:500, color:"#94A3B8", marginBottom:"0.75rem" }}>{p.name}</div>
              <div style={{ fontFamily:"monospace", fontSize:"2.4rem", fontWeight:800, lineHeight:1, color:p.featured?p.color:"#fff", marginBottom:4 }}>{p.price}</div>
              <div style={{ fontSize:13, color:"#64748B", marginBottom:"1.25rem" }}>{p.inr}</div>
              <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.06)", marginBottom:"1.25rem" }} />
              <ul style={{ listStyle:"none", marginBottom:"1.5rem" }}>
                {p.features.map((f: string) => (<li key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#94A3B8", marginBottom:10 }}><span style={{ color:"#22C55E", flexShrink:0, marginTop:1 }}>✓</span>{f}</li>))}
                {p.missing.map((f: string) => (<li key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#334155", marginBottom:10 }}><span style={{ flexShrink:0 }}>—</span>{f}</li>))}
              </ul>
              <button onClick={() => handlePlanClick(p.plan)} disabled={loading===p.plan || user?.plan===p.plan} style={{ width:"100%", padding:"13px", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", background:p.featured?"linear-gradient(135deg,#4F8EF7,#7C3AED)":p.plan==="free"?"rgba(255,255,255,0.05)":"transparent", color:p.featured?"#fff":"#94A3B8", border:p.featured?"none":"1px solid rgba(255,255,255,0.1)", opacity:user?.plan===p.plan?0.5:1, transition:"all 0.2s", boxShadow:p.featured?"0 0 20px rgba(79,142,247,0.3)":"none" }}>
                {loading===p.plan ? "Processing..." : user?.plan===p.plan ? "Current plan" : p.plan==="free" ? "View upgrade options" : p.plan==="enterprise" ? "Contact us" : "Upgrade to "+p.name}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", marginTop:"3rem", color:"#64748B", fontSize:13, opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease 0.5s both":"none" }}>
          All plans include: Groq AI analysis · Secure encryption · Cancel anytime · GDPR compliant
        </div>
      </div>
    </div>
  )
}
