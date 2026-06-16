
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import api from "@/lib/api"

const AUDIT_SECTIONS = [
  { id:"governance", title:"AI Governance", icon:"🏛️", questions:[
    "Does your organization have a dedicated AI ethics committee or governance body?",
    "Is there a documented AI policy approved by senior leadership?",
    "Are AI risks reviewed at board or executive level?",
    "Do you have a Chief AI Officer or equivalent role?",
  ]},
  { id:"data", title:"Data Management", icon:"🗄️", questions:[
    "Do you maintain a data inventory of all AI training datasets?",
    "Are data sources documented with provenance and lineage?",
    "Is there a process to detect and mitigate bias in training data?",
    "Do you have data retention and deletion policies for AI data?",
  ]},
  { id:"transparency", title:"Transparency & Explainability", icon:"🔍", questions:[
    "Can your AI systems explain decisions to affected individuals?",
    "Do you provide meaningful information about AI use to users?",
    "Are AI-generated outputs clearly labeled as such?",
    "Do you maintain documentation of model architecture and training?",
  ]},
  { id:"human_oversight", title:"Human Oversight", icon:"👁️", questions:[
    "Are there human review processes for high-stakes AI decisions?",
    "Can humans override or override AI decisions?",
    "Are there clear escalation paths when AI systems fail?",
    "Do employees receive training on AI oversight responsibilities?",
  ]},
  { id:"security", title:"Security & Privacy", icon:"🔒", questions:[
    "Are AI models protected against adversarial attacks?",
    "Is personal data used in AI systems encrypted at rest and in transit?",
    "Do you conduct regular security assessments of AI systems?",
    "Are access controls in place for AI model training and deployment?",
  ]},
  { id:"testing", title:"Testing & Validation", icon:"🧪", questions:[
    "Do you conduct pre-deployment bias and fairness testing?",
    "Are AI systems tested against regulatory requirements before launch?",
    "Do you have a process for continuous monitoring of AI performance?",
    "Are there defined KPIs for AI system performance and compliance?",
  ]},
  { id:"incident", title:"Incident Management", icon:"🚨", questions:[
    "Is there a documented AI incident response plan?",
    "Do you have a process to report AI-related harms to regulators?",
    "Are affected individuals notified when AI errors impact them?",
    "Do you conduct post-incident reviews for AI failures?",
  ]},
  { id:"vendor", title:"Third-Party & Vendor", icon:"🤝", questions:[
    "Do you assess AI compliance of third-party AI vendors?",
    "Are AI vendor contracts reviewed for compliance obligations?",
    "Do you conduct due diligence on AI tools used internally?",
    "Is there oversight of AI systems developed by external parties?",
  ]},
]

const MATURITY_LEVELS = [
  { score:[0,25], level:"Initial", color:"#EF4444", desc:"Ad hoc, no formal AI governance in place. High regulatory risk." },
  { score:[26,50], level:"Developing", color:"#F59E0B", desc:"Some policies exist but inconsistently applied. Significant gaps remain." },
  { score:[51,75], level:"Defined", color:"#4F8EF7", desc:"Documented processes in place. Moderate compliance posture." },
  { score:[76,90], level:"Managed", color:"#22C55E", desc:"Proactive governance. Well-defined controls and monitoring." },
  { score:[91,100], level:"Optimized", color:"#7C3AED", desc:"Industry-leading AI compliance. Continuous improvement culture." },
]

export default function AIAuditPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<"intro"|"audit"|"results">("intro")
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<any>({})
  const [orgName, setOrgName] = useState("")
  const [industry, setIndustry] = useState("")
  const [visible, setVisible] = useState(false)
  const [animScore, setAnimScore] = useState(0)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const totalQ = AUDIT_SECTIONS.reduce((a: number, s: any) => a + s.questions.length, 0)
  const answered = Object.keys(answers).length
  const progress = Math.round((answered / totalQ) * 100)

  const getScore = () => {
    const yesCount = Object.values(answers).filter((v: any) => v === "yes").length
    return Math.round((yesCount / totalQ) * 100)
  }

  const getSectionScore = (section: any) => {
    const sectionAnswers = section.questions.map((_: any, i: number) => answers[`${section.id}-${i}`])
    const yes = sectionAnswers.filter((a: any) => a === "yes").length
    return Math.round((yes / section.questions.length) * 100)
  }

  const getMaturity = (score: number) => MATURITY_LEVELS.find((m: any) => score >= m.score[0] && score <= m.score[1]) || MATURITY_LEVELS[0]

  const startAudit = () => {
    if (!orgName) { toast.error("Enter organization name"); return }
    setStep("audit")
  }

  const finishAudit = () => {
    const score = getScore()
    setStep("results")
    let s = 0
    const timer = setInterval(() => {
      s += 2
      setAnimScore(s)
      if (s >= score) { setAnimScore(score); clearInterval(timer) }
    }, 30)
  }

  const downloadReport = async () => {
    try {
      const res = await api.post("/compliance/audit/report", {
        org_name: orgName,
        industry: industry,
        score: getScore(),
        answers: answers,
        sections: AUDIT_SECTIONS
      }, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url; a.download = `AI_Audit_${orgName}.pdf`; a.click()
      toast.success("Professional PDF downloaded!")
      return
    } catch { }
    const downloadReportFallback = () => {
    const score = getScore()
    const maturity = getMaturity(score)
    const lines = [
      `ComplianceAI - AI Governance Audit Report`,
      `Organization: ${orgName}`,
      `Industry: ${industry}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Overall Score: ${score}/100`,
      `Maturity Level: ${maturity.level}`,
      "",
      "SECTION SCORES:",
      ...AUDIT_SECTIONS.map((s: any) => `${s.title}: ${getSectionScore(s)}/100`),
      "",
      "RECOMMENDATIONS:",
      ...AUDIT_SECTIONS.filter((s: any) => getSectionScore(s) < 75).map((s: any) => `- Improve ${s.title} (${getSectionScore(s)}/100)`),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `AI_Audit_${orgName}.txt`; a.click()
    toast.success("Audit report downloaded!") }
  }

  if (loading || !user) return null

  const score = getScore()
  const maturity = getMaturity(score)

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`@keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-200, right:-200 }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)", bottom:0, left:0 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>

        {/* INTRO */}
        {step === "intro" && (
          <div style={{ opacity:visible?1:0, transition:"all 0.6s ease" }}>
            <div style={{ textAlign:"center", marginBottom:"3rem" }}>
              <div style={{ fontSize:64, marginBottom:"1rem" }}>🔍</div>
              <h1 style={{ fontSize:"2.2rem", fontWeight:800, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"1rem" }}>AI Compliance Audit</h1>
              <p style={{ color:"#94A3B8", fontSize:15, lineHeight:1.7, maxWidth:600, margin:"0 auto" }}>
                Comprehensive audit of your organization AI governance maturity across 8 domains, 32 questions. Takes 10-15 minutes. Get a maturity score and actionable recommendations.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"2rem" }}>
              {[
                { icon:"📋", label:"8 Domains", desc:"Governance, Data, Security..." },
                { icon:"❓", label:"32 Questions", desc:"Yes/No/Partial answers" },
                { icon:"📊", label:"Maturity Score", desc:"0-100 with level rating" },
                { icon:"📄", label:"PDF Report", desc:"Download detailed report" },
              ].map((f: any) => (
                <div key={f.label} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem", textAlign:"center", backdropFilter:"blur(10px)" }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{f.icon}</div>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{f.label}</div>
                  <div style={{ fontSize:12, color:"#64748B" }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"2rem", backdropFilter:"blur(10px)" }}>
              <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.5rem", color:"#4F8EF7" }}>Organization Details</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
                <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6, textTransform:"uppercase" }}>Organization Name *</label><input className="input" placeholder="e.g. TechCorp India Pvt Ltd" value={orgName} onChange={(e: any) => setOrgName(e.target.value)} /></div>
                <div><label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6, textTransform:"uppercase" }}>Industry</label><input className="input" placeholder="e.g. FinTech, Healthcare, EdTech" value={industry} onChange={(e: any) => setIndustry(e.target.value)} /></div>
              </div>

              <div style={{ background:"rgba(79,142,247,0.05)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:10, padding:"1rem", marginBottom:"1.5rem", fontSize:12, color:"#94A3B8" }}>
                🔒 Your audit responses are private and only visible to you. We do not share audit data with third parties.
              </div>

              <button onClick={startAudit} style={{ width:"100%", padding:"16px", borderRadius:12, border:"none", cursor:"pointer", fontSize:15, fontWeight:700, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", boxShadow:"0 0 30px rgba(79,142,247,0.3)" }}>
                Start AI Governance Audit →
              </button>
            </div>
          </div>
        )}

        {/* AUDIT QUESTIONS */}
        {step === "audit" && (
          <div style={{ opacity:visible?1:0, transition:"all 0.5s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
              <div>
                <h2 style={{ fontSize:"1.2rem", fontWeight:700 }}>{orgName} — AI Audit</h2>
                <p style={{ fontSize:13, color:"#64748B", marginTop:2 }}>{answered} of {totalQ} questions answered</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"1.5rem", fontWeight:700, fontFamily:"monospace", color:"#4F8EF7" }}>{progress}%</div>
                <div style={{ fontSize:12, color:"#64748B" }}>complete</div>
              </div>
            </div>

            <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, marginBottom:"2rem", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#4F8EF7,#7C3AED)", borderRadius:3, transition:"width 0.3s ease" }} />
            </div>

            <div style={{ display:"flex", gap:8, marginBottom:"1.5rem", flexWrap:"wrap" }}>
              {AUDIT_SECTIONS.map((s: any, i: number) => {
                const secAnswered = s.questions.filter((_: any, qi: number) => answers[`${s.id}-${qi}`]).length
                const complete = secAnswered === s.questions.length
                return (
                  <button key={s.id} onClick={() => setCurrent(i)} style={{ padding:"6px 12px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:500, background:current===i?"linear-gradient(135deg,#4F8EF7,#7C3AED)":complete?"rgba(34,197,94,0.15)":"rgba(17,34,64,0.8)", border:current===i?"none":complete?"1px solid rgba(34,197,94,0.3)":"1px solid rgba(255,255,255,0.06)", color:current===i?"#fff":complete?"#22C55E":"#94A3B8", transition:"all 0.2s" }}>
                    {s.icon} {s.title} {complete?"✓":""}
                  </button>
                )
              })}
            </div>

            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"2rem", backdropFilter:"blur(10px)" }}>
              <h3 style={{ fontSize:"1.1rem", fontWeight:600, marginBottom:"0.5rem", color:"#4F8EF7" }}>
                {AUDIT_SECTIONS[current].icon} {AUDIT_SECTIONS[current].title}
              </h3>
              <p style={{ fontSize:13, color:"#64748B", marginBottom:"1.5rem" }}>Section {current+1} of {AUDIT_SECTIONS.length}</p>

              {AUDIT_SECTIONS[current].questions.map((q: string, qi: number) => {
                const key = `${AUDIT_SECTIONS[current].id}-${qi}`
                const val = answers[key]
                return (
                  <div key={qi} style={{ background:"rgba(0,0,0,0.2)", borderRadius:12, padding:"1.25rem", marginBottom:12, border:`1px solid ${val?"rgba(79,142,247,0.2)":"rgba(255,255,255,0.04)"}` }}>
                    <p style={{ fontSize:14, color:"#fff", marginBottom:"1rem", lineHeight:1.5 }}><strong style={{ color:"#4F8EF7" }}>Q{qi+1}.</strong> {q}</p>
                    <div style={{ display:"flex", gap:10 }}>
                      {[
                        { value:"yes", label:"Yes", color:"#22C55E", bg:"rgba(34,197,94,0.2)" },
                        { value:"partial", label:"Partial", color:"#F59E0B", bg:"rgba(245,158,11,0.2)" },
                        { value:"no", label:"No", color:"#EF4444", bg:"rgba(239,68,68,0.2)" },
                        { value:"na", label:"N/A", color:"#64748B", bg:"rgba(100,116,139,0.2)" },
                      ].map((opt: any) => (
                        <button key={opt.value} onClick={() => setAnswers({...answers, [key]:opt.value})} style={{ padding:"8px 20px", borderRadius:8, border:`2px solid ${val===opt.value?opt.color:"rgba(255,255,255,0.1)"}`, background:val===opt.value?opt.bg:"transparent", color:val===opt.value?opt.color:"#94A3B8", cursor:"pointer", fontSize:13, fontWeight:val===opt.value?600:400, transition:"all 0.15s" }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
                <button onClick={() => setCurrent(Math.max(0, current-1))} disabled={current===0} style={{ padding:"10px 20px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:13, opacity:current===0?0.4:1 }}>← Previous</button>
                {current < AUDIT_SECTIONS.length-1 ? (
                  <button onClick={() => setCurrent(current+1)} style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:600 }}>Next Section →</button>
                ) : (
                  <button onClick={finishAudit} style={{ padding:"10px 24px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#22C55E,#16A34A)", color:"#fff", fontSize:13, fontWeight:700, boxShadow:"0 0 20px rgba(34,197,94,0.3)" }}>Complete Audit ✓</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === "results" && (
          <div style={{ opacity:visible?1:0, transition:"all 0.6s ease" }}>
            <div style={{ textAlign:"center", marginBottom:"2rem" }}>
              <h1 style={{ fontSize:"1.8rem", fontWeight:700, marginBottom:"0.5rem" }}>Audit Complete!</h1>
              <p style={{ color:"#94A3B8", fontSize:14 }}>{orgName} — AI Governance Maturity Assessment</p>
            </div>

            <div style={{ background:"rgba(17,34,64,0.8)", border:`2px solid ${maturity.color}40`, borderRadius:20, padding:"2.5rem", textAlign:"center", marginBottom:"2rem", backdropFilter:"blur(10px)", boxShadow:`0 0 40px ${maturity.color}20` }}>
              <div style={{ fontSize:"5rem", fontWeight:900, fontFamily:"monospace", color:maturity.color, marginBottom:"0.5rem", animation:"pulse 2s ease-in-out infinite" }}>{animScore}</div>
              <div style={{ fontSize:14, color:"#64748B", marginBottom:"1rem" }}>/ 100 Overall Score</div>
              <div style={{ fontSize:"1.5rem", fontWeight:700, color:maturity.color, marginBottom:"0.5rem" }}>{maturity.level}</div>
              <div style={{ fontSize:14, color:"#94A3B8", maxWidth:500, margin:"0 auto" }}>{maturity.desc}</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"2rem" }}>
              {MATURITY_LEVELS.map((m: any) => (
                <div key={m.level} style={{ background:maturity.level===m.level?`${m.color}20`:"rgba(17,34,64,0.5)", border:`1px solid ${maturity.level===m.level?m.color:"rgba(255,255,255,0.06)"}`, borderRadius:12, padding:"1rem", textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:m.color, marginBottom:4 }}>{m.level}</div>
                  <div style={{ fontSize:11, color:"#64748B" }}>{m.score[0]}-{m.score[1]}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Section Breakdown</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"2rem" }}>
              {AUDIT_SECTIONS.map((s: any) => {
                const ss = getSectionScore(s)
                const c = ss > 75 ? "#22C55E" : ss > 50 ? "#F59E0B" : "#EF4444"
                return (
                  <div key={s.id} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"1.25rem", backdropFilter:"blur(10px)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:14, fontWeight:500 }}>{s.icon} {s.title}</span>
                      <span style={{ fontFamily:"monospace", fontSize:"1.2rem", fontWeight:700, color:c }}>{ss}</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${ss}%`, background:c, borderRadius:3, transition:"width 1s ease" }} />
                    </div>
                    {ss < 75 && <p style={{ fontSize:11, color:"#64748B", marginTop:6 }}>Needs improvement</p>}
                  </div>
                )
              })}
            </div>

            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", marginBottom:"2rem", backdropFilter:"blur(10px)" }}>
              <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#EF4444" }}>Priority Recommendations</h3>
              {AUDIT_SECTIONS.filter((s: any) => getSectionScore(s) < 75).map((s: any) => (
                <div key={s.id} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:2 }}>{s.title} — {getSectionScore(s)}/100</div>
                    <div style={{ fontSize:12, color:"#64748B" }}>Improve {s.title.toLowerCase()} policies and controls to meet regulatory standards</div>
                  </div>
                  <span style={{ marginLeft:"auto", fontSize:12, color:"#EF4444", fontWeight:600, flexShrink:0 }}>Priority</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button onClick={downloadReport} style={{ flex:1, padding:"14px", borderRadius:12, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", boxShadow:"0 0 20px rgba(79,142,247,0.3)" }}>Download Audit Report</button>
              <button onClick={() => { setStep("intro"); setAnswers({}); setAnimScore(0) }} style={{ padding:"14px 20px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:14 }}>New Audit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
