
"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"

const PARTICLES = [
  {w:4.2,h:4.4,l:"73.1%",t:"35.4%",a1:6.4,a2:1.9,o:0.6},
  {w:2.3,h:3.3,l:"41.8%",t:"25.6%",a1:6.9,a2:0.5,o:0.6},
  {w:3.4,h:3.0,l:"61.4%",t:"60.6%",a1:6.4,a2:1.4,o:0.3},
  {w:3.3,h:3.2,l:"24.6%",t:"78.5%",a1:6.1,a2:1.5,o:0.3},
  {w:3.4,h:3.2,l:"49.9%",t:"59.5%",a1:5.4,a2:0.7,o:0.3},
  {w:2.5,h:2.2,l:"62.5%",t:"79.0%",a1:3.4,a2:1.1,o:0.6},
  {w:2.6,h:3.9,l:"20.5%",t:"85.4%",a1:6.8,a2:1.9,o:0.6},
  {w:4.9,h:2.0,l:"56.0%",t:"32.0%",a1:6.9,a2:1.3,o:0.5},
  {w:3.5,h:2.7,l:"72.5%",t:"82.1%",a1:3.1,a2:0.9,o:0.3},
  {w:4.6,h:3.0,l:"55.1%",t:"8.4%",a1:5.0,a2:0.3,o:0.6},
  {w:2.3,h:4.6,l:"27.2%",t:"51.0%",a1:5.6,a2:0.9,o:0.6},
  {w:2.6,h:2.6,l:"93.9%",t:"66.4%",a1:6.0,a2:1.5,o:0.5},
  {w:3.1,h:3.6,l:"40.0%",t:"16.5%",a1:5.3,a2:1.9,o:0.5},
  {w:2.8,h:2.9,l:"90.5%",t:"66.6%",a1:3.7,a2:1.1,o:0.3},
  {w:4.6,h:4.8,l:"57.8%",t:"37.5%",a1:5.2,a2:1.4,o:0.5},
]

const FEATURES = [
  { icon:"🧠", title:"RAG-Powered Analysis", desc:"Retrieves exact regulation clauses before generating your compliance verdict. Not guesswork — actual law.", tag:"LangChain + FAISS" },
  { icon:"⚖️", title:"Multi-Country Comparison", desc:"Run one AI system against 10 countries simultaneously. Side-by-side compliance matrix.", tag:"10 frameworks" },
  { icon:"📄", title:"Professional PDF Reports", desc:"Download board-ready compliance reports with country breakdown, risk scores, and remediation steps.", tag:"ReportLab" },
  { icon:"🎯", title:"Risk Scoring Engine", desc:"Each check returns Low, Medium, High risk rating based on your industry, data types, and deployment region.", tag:"Industry-specific" },
  { icon:"📁", title:"Document Upload", desc:"Upload any AI policy, terms of service, or system design document. AI automatically extracts and analyzes compliance.", tag:"PDF, DOC, TXT" },
  { icon:"💬", title:"AI Compliance Chat", desc:"Ask our AI assistant anything about regulations. Get instant answers cited from actual law across 10 countries.", tag:"Groq LLaMA" },
]

const COUNTRIES = [
  {flag:"EU",name:"European Union",law:"EU AI Act 2024",color:"#EF4444"},
  {flag:"IN",name:"India",law:"DPDP Act 2023",color:"#F59E0B"},
  {flag:"US",name:"United States",law:"NIST AI RMF",color:"#4F8EF7"},
  {flag:"GB",name:"United Kingdom",law:"UK AI Framework",color:"#22C55E"},
  {flag:"CA",name:"Canada",law:"AIDA",color:"#8B5CF6"},
  {flag:"SG",name:"Singapore",law:"Model AI Gov",color:"#06B6D4"},
  {flag:"AU",name:"Australia",law:"AI Ethics",color:"#F97316"},
  {flag:"BR",name:"Brazil",law:"Lei de IA",color:"#10B981"},
  {flag:"CN",name:"China",law:"GenAI Regs",color:"#EF4444"},
  {flag:"JP",name:"Japan",law:"METI Guidelines",color:"#6366F1"},
]

export default function HomePage() {
  const [score, setScore] = useState(0)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState({hero:false,stats:false,features:false,countries:false})
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const countriesRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    setTimeout(() => setVisible(v=>({...v,hero:true})), 100)
    const timer = setTimeout(() => {
      let s = 0
      const t = setInterval(() => { s++; setScore(s); if (s >= 37) clearInterval(t) }, 40)
    }, 800)

    const handleMouse = (e: any) => { setMouseX(e.clientX); setMouseY(e.clientY) }
    const handleScroll = () => {
      setScrollY(window.scrollY)
      const check = (ref, key) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          if (rect.top < window.innerHeight - 100) setVisible(v=>({...v,[key]:true}))
        }
      }
      check(statsRef, "stats")
      check(featuresRef, "features")
      check(countriesRef, "countries")
    }
    window.addEventListener("mousemove", handleMouse)
    window.addEventListener("scroll", handleScroll)
    return () => { clearTimeout(timer); window.removeEventListener("mousemove", handleMouse); window.removeEventListener("scroll", handleScroll) }
  }, [])

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", overflowX:"hidden" }}>
      <Navbar />
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer { 0%{opacity:0.3} 50%{opacity:1} 100%{opacity:0.3} }
        @keyframes slide-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        .feature-card:hover { transform:translateY(-8px) scale(1.02) !important; border-color:rgba(79,142,247,0.5) !important; }
        .country-card:hover { transform:translateY(-6px) scale(1.05) !important; }
        .glow-btn:hover { box-shadow:0 0 30px rgba(79,142,247,0.5) !important; transform:translateY(-2px) !important; }
      `}</style>

      {/* BACKGROUND */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.05) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.15) 0%,transparent 70%)", top:-100, right:-100, transform:mounted?`translate(${mouseX*0.02}px,${mouseY*0.02}px)`:"none", transition:"transform 0.3s ease" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)", bottom:100, left:-100, transform:mounted?`translate(${-mouseX*0.015}px,${-mouseY*0.015}px)`:"none", transition:"transform 0.3s ease" }} />
        {mounted && PARTICLES.map((p,i) => (
          <div key={i} style={{ position:"absolute", width:p.w, height:p.h, borderRadius:"50%", background:`rgba(79,142,247,${p.o})`, left:p.l, top:p.t, animation:`float ${p.a1}s ease-in-out ${p.a2}s infinite, shimmer ${p.a1*0.7}s ease-in-out ${p.a2*0.5}s infinite` }} />
        ))}
      </div>

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", padding:"8rem 2rem 4rem", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center" }}>
          <div style={{ opacity:visible.hero?1:0, transform:visible.hero?"translateY(0)":"translateY(40px)", transition:"all 0.8s ease" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:20, padding:"6px 16px", marginBottom:"1.5rem" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#4F8EF7", animation:"shimmer 2s infinite" }} />
              <span style={{ fontSize:11, fontWeight:600, color:"#4F8EF7", textTransform:"uppercase", letterSpacing:"0.08em" }}>AI Governance Platform</span>
            </div>
            <h1 style={{ fontSize:"clamp(2.2rem,4vw,3.5rem)", fontWeight:800, lineHeight:1.1, marginBottom:"1.25rem", letterSpacing:"-0.03em" }}>
              AI compliance across{" "}
              <span style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>10 countries</span>
              <br />in minutes
            </h1>
            <p style={{ fontSize:"1.1rem", color:"#94A3B8", lineHeight:1.7, marginBottom:"2rem" }}>
              Replace <span style={{ color:"#EF4444", fontWeight:600 }}>$500/hr</span> legal consultants with instant AI-powered compliance checks. Multi-country analysis with PDF reports for <span style={{ color:"#22C55E", fontWeight:600 }}>$12/month</span>.
            </p>
            <div style={{ display:"flex", gap:12, marginBottom:"2rem" }}>
              <Link href="/auth/register" className="glow-btn" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"16px 32px", borderRadius:12, fontWeight:600, fontSize:16, transition:"all 0.3s" }}>Start free</Link>
              <Link href="/regulations" style={{ display:"inline-flex", alignItems:"center", background:"transparent", color:"#fff", textDecoration:"none", padding:"16px 28px", borderRadius:12, fontWeight:500, fontSize:15, border:"1px solid rgba(255,255,255,0.15)" }}>View regulations</Link>
            </div>
            <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
              {["No credit card required","3 free checks/month","PDF report included"].map(t=>(
                <span key={t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748B" }}><span style={{ color:"#22C55E" }}>✓</span>{t}</span>
              ))}
            </div>
          </div>

          {/* METER CARD */}
          <div style={{ opacity:visible.hero?1:0, transform:visible.hero?"translateY(0)":"translateY(40px)", transition:"all 0.8s ease 0.2s" }}>
            <div style={{ background:"linear-gradient(135deg,#112240,#0F1E3A)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:20, padding:"2rem", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#4F8EF7,#7C3AED,transparent)", animation:"gradient-shift 2s linear infinite", backgroundSize:"200%" }} />
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
                <span style={{ fontSize:13, color:"#94A3B8" }}>Live compliance analysis</span>
                <span style={{ fontSize:11, color:"#22C55E", display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"#22C55E", display:"inline-block", animation:"shimmer 1.5s infinite" }} />ANALYZING
                </span>
              </div>
              <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:"1rem", marginBottom:"1rem", fontSize:11, color:"#94A3B8", fontFamily:"monospace", lineHeight:1.6, border:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ color:"#4F8EF7", fontSize:9, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>AI System</div>
                Facial recognition hiring tool scanning candidate video interviews. Processes biometric data. Deployed EU + India.
              </div>
              <div style={{ display:"flex", gap:6, marginBottom:"1rem", flexWrap:"wrap" }}>
                {["EU AI Act","DPDP Act","NIST RMF"].map(c=>(<span key={c} style={{ fontSize:11, padding:"4px 10px", borderRadius:6, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.2)", color:"#4F8EF7" }}>{c}</span>))}
              </div>
              {[{name:"European Union",width:"28%",color:"#EF4444",status:"Non-Compliant"},{name:"India",width:"55%",color:"#F59E0B",status:"Partial"},{name:"USA",width:"48%",color:"#F59E0B",status:"Partial"}].map((r: any, i: number)=>(
                <div key={r.name} style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:10, padding:"10px", marginBottom:8 }}>
                  <span style={{ fontSize:11, flex:1, color:"#fff", fontWeight:500 }}>{r.name}</span>
                  <div style={{ flex:2, height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:r.width, background:r.color, borderRadius:2, transition:"width 1.5s ease" }} />
                  </div>
                  <span style={{ fontSize:10, color:r.color, fontWeight:600, minWidth:80, textAlign:"right" }}>{r.status}</span>
                </div>
              ))}
              <div style={{ marginTop:"1.5rem", paddingTop:"1rem", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontFamily:"monospace", fontSize:"2.8rem", fontWeight:700, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{score}</span>
                <div>
                  <div style={{ fontSize:13, color:"#94A3B8" }}>/ 100 overall score</div>
                  <div style={{ fontSize:11, color:"#EF4444" }}>3 critical issues found</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div ref={statsRef} style={{ background:"rgba(17,34,64,0.8)", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"2.5rem 2rem", position:"relative", zIndex:1, backdropFilter:"blur(10px)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"2rem", textAlign:"center" }}>
          {[["10+","Countries covered"],["<60s","Per compliance check"],["$500/hr","Cost we replace"],["$12/mo","Starting price"]].map(([n,l],i)=>(
            <div key={l} style={{ opacity:visible.stats?1:0, transform:visible.stats?"translateY(0)":"translateY(20px)", transition:`all 0.5s ease ${i*0.1}s` }}>
              <div style={{ fontFamily:"monospace", fontSize:"2rem", fontWeight:700, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{n}</div>
              <div style={{ fontSize:13, color:"#64748B", marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section ref={featuresRef} style={{ padding:"6rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3rem", opacity:visible.features?1:0, transition:"all 0.6s ease" }}>
            <div style={{ fontFamily:"monospace", fontSize:11, color:"#4F8EF7", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>Platform</div>
            <h2 style={{ fontSize:"clamp(1.8rem,3vw,2.5rem)", fontWeight:700, letterSpacing:"-0.02em" }}>Built for compliance teams, not lawyers</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
            {FEATURES.map((f: any, i: number)=>(
              <div key={f.title} className="feature-card" style={{ background:"linear-gradient(135deg,#112240,#0F1E3A)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.75rem", transition:"all 0.3s ease", opacity:visible.features?1:0, transform:visible.features?"translateY(0)":"translateY(30px)", transitionDelay:`${i*0.1}s` }}>
                <div style={{ fontSize:32, marginBottom:"1rem" }}>{f.icon}</div>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>{f.title}</div>
                <div style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6, marginBottom:"1rem" }}>{f.desc}</div>
                <span style={{ fontFamily:"monospace", fontSize:10, color:"#4F8EF7", background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.2)", padding:"3px 10px", borderRadius:4 }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTRIES */}
      <section ref={countriesRef} style={{ padding:"4rem 2rem 6rem", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <h2 style={{ fontSize:"1.8rem", fontWeight:700 }}>10 regulatory frameworks</h2>
            <p style={{ color:"#94A3B8", marginTop:8 }}>One platform covers where your AI actually operates</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
            {COUNTRIES.map((c: any, i: number)=>(
              <div key={c.flag} className="country-card" style={{ background:"linear-gradient(135deg,#112240,#0F1E3A)", border:`1px solid ${c.color}30`, borderRadius:12, padding:"1.25rem 1rem", textAlign:"center", cursor:"pointer", transition:"all 0.3s ease", opacity:visible.countries?1:0, transform:visible.countries?"translateY(0)":"translateY(20px)", transitionDelay:`${i*0.05}s` }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:`${c.color}20`, border:`2px solid ${c.color}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 0.75rem", fontWeight:700, fontSize:11, color:c.color }}>{c.flag}</div>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{c.name}</div>
                <div style={{ fontFamily:"monospace", fontSize:10, color:"#64748B" }}>{c.law}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"6rem 2rem", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:700, margin:"0 auto", background:"linear-gradient(135deg,rgba(79,142,247,0.1),rgba(124,58,237,0.1))", border:"1px solid rgba(79,142,247,0.2)", borderRadius:24, padding:"3rem", position:"relative", overflow:"hidden" }}>
          <h2 style={{ fontSize:"2rem", fontWeight:700, marginBottom:"1rem" }}>Your AI is probably non-compliant somewhere.</h2>
          <p style={{ color:"#94A3B8", marginBottom:"2rem", fontSize:15 }}>Find out in 60 seconds. Free plan, no credit card.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <Link href="/auth/register" className="glow-btn" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"16px 32px", borderRadius:12, fontWeight:600, fontSize:16, transition:"all 0.3s" }}>Start for free</Link>
            <Link href="/upload" style={{ display:"inline-flex", alignItems:"center", background:"transparent", color:"#fff", textDecoration:"none", padding:"16px 24px", borderRadius:12, fontWeight:500, fontSize:15, border:"1px solid rgba(255,255,255,0.15)" }}>Upload document</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"2rem", display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:"#4F8EF7", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12 }}>CA</div>
          <span style={{ fontSize:13, color:"#64748B" }}>ComplianceAI 2024</span>
        </div>
        <div style={{ display:"flex", gap:"1.5rem" }}>
          {["Privacy","Terms","Regulations","Contact"].map(l=><a key={l} href="#" style={{ fontSize:13, color:"#64748B", textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  )
}
