
"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { paymentAPI } from "@/lib/api"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"

const PLANS = [
  { name:"Free", price:"$0", inr:"Rs 0/mo", plan:"free", features:["1 country per check","3 checks/month","Basic report","Community support"], missing:["PDF download","Multi-country","API access"] },
  { name:"Starter", price:"$12", inr:"Rs 999/mo", plan:"starter", features:["5 countries per check","20 checks/month","PDF reports","Email support","Regulation updates"], missing:["Unlimited checks","API access"] },
  { name:"Pro", price:"$35", inr:"Rs 2,999/mo", plan:"pro", featured:true, features:["All 10 countries","Unlimited checks","Detailed PDF reports","Priority support","Auto regulation updates","Document upload"], missing:[] },
  { name:"Enterprise", price:"Custom", inr:"Contact us", plan:"enterprise", features:["Everything in Pro","REST API access","White-label option","SLA guarantee","Dedicated support","Custom regulations"], missing:[] },
]

declare global { interface Window { Razorpay: any } }

export default function PricingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string|null>(null)
  const [visible, setVisible] = useState<boolean>(false)
  useEffect(() => { setTimeout(()=>setVisible(true),100) }, [])

  const handleUpgrade = async (plan) => {
    if (!user) { window.location.href="/auth/register"; return }
    if (plan==="enterprise") { toast("Contact: contact@complianceai.in"); return }
    if (plan==="free") return
    setLoading(plan)
    try {
      const res = await paymentAPI.createOrder({plan})
      const order = res.data
      const script = document.createElement("script"); script.src="https://checkout.razorpay.com/v1/checkout.js"; document.body.appendChild(script)
      script.onload = () => {
        const rzp = new window.Razorpay({ key:order.key_id, amount:order.amount, currency:order.currency, name:"ComplianceAI", description:plan+" Plan", order_id:order.order_id,
          handler: async (response) => {
            try { await paymentAPI.verify({razorpay_order_id:response.razorpay_order_id,razorpay_payment_id:response.razorpay_payment_id,razorpay_signature:response.razorpay_signature,plan}); toast.success("Upgraded to "+plan+"!"); window.location.href="/dashboard" }
            catch { toast.error("Verification failed") }
          }, prefill:{email:user?.email,name:user?.full_name}, theme:{color:"#4F8EF7"}
        }); rzp.open()
      }
    } catch (err: any) { toast.error(err.response?.data?.detail||"Payment failed") } finally { setLoading(null) }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`@keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}} @keyframes gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-200, right:-200 }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)", bottom:-100, left:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"8rem 2rem 4rem", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:"3rem", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"all 0.5s ease" }}>
          <div style={{ fontFamily:"monospace", fontSize:11, color:"#4F8EF7", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>Pricing</div>
          <h1 style={{ fontSize:"clamp(2rem,4vw,2.8rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:"1rem", background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Fraction of the cost. All the coverage.</h1>
          <p style={{ color:"#94A3B8", fontSize:"1rem", maxWidth:500, margin:"0 auto" }}>One lawyer hour costs more than a year of ComplianceAI Pro. No hidden fees.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.5rem", alignItems:"start" }}>
          {PLANS.map((p: any, i: number)=>(
            <div key={p.name} style={{ background:p.featured?"linear-gradient(135deg,rgba(79,142,247,0.15),rgba(124,58,237,0.1))":"rgba(17,34,64,0.8)", border:p.featured?"2px solid #4F8EF7":"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"1.75rem", position:"relative", backdropFilter:"blur(10px)", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(30px)", transition:`all 0.5s ease ${i*0.1}s`, boxShadow:p.featured?"0 0 40px rgba(79,142,247,0.2)":"none" }}>
              {p.featured && (
                <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 18px", borderRadius:20, whiteSpace:"nowrap" }}>Most popular</div>
              )}
              <div style={{ fontSize:14, fontWeight:500, color:"#94A3B8", marginBottom:"0.75rem" }}>{p.name}</div>
              <div style={{ fontFamily:"monospace", fontSize:"2.4rem", fontWeight:800, lineHeight:1, background:p.featured?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"none", WebkitBackgroundClip:p.featured?"text":"unset", WebkitTextFillColor:p.featured?"transparent":"#fff", color:p.featured?"transparent":"#fff" }}>{p.price}</div>
              <div style={{ fontSize:13, color:"#64748B", marginTop:4, marginBottom:"1.25rem" }}>{p.inr}</div>
              <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.06)", marginBottom:"1.25rem" }} />
              <ul style={{ listStyle:"none", marginBottom:"1.5rem" }}>
                {p.features.map(f=>(<li key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#94A3B8", marginBottom:10 }}><span style={{ color:"#22C55E", flexShrink:0, marginTop:1 }}>✓</span>{f}</li>))}
                {p.missing.map(f=>(<li key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#334155", marginBottom:10 }}><span style={{ flexShrink:0 }}>—</span>{f}</li>))}
              </ul>
              <button onClick={()=>handleUpgrade(p.plan)} disabled={loading===p.plan||user?.plan===p.plan} style={{ width:"100%", padding:"13px", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", background:p.featured?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent", color:p.featured?"#fff":"#94A3B8", border:p.featured?"none":"1px solid rgba(255,255,255,0.1)", opacity:user?.plan===p.plan?0.5:1, transition:"all 0.2s", boxShadow:p.featured?"0 0 20px rgba(79,142,247,0.3)":"none" }}>
                {loading===p.plan?"Processing...":user?.plan===p.plan?"Current plan":p.plan==="free"?"Start free":p.plan==="enterprise"?"Contact us":"Upgrade to "+p.name}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", marginTop:"3rem", color:"#64748B", fontSize:13, opacity:visible?1:0, transition:"all 0.5s ease 0.5s" }}>
          All plans include: Groq AI analysis · Secure encryption · Cancel anytime · GDPR compliant
        </div>
      </div>
    </div>
  )
}
