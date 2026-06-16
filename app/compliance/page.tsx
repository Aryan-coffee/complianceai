
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { complianceAPI } from "@/lib/api"
import api from "@/lib/api"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import Link from "next/link"

const COUNTRIES = ["EU","India","USA","UK","Canada","Singapore","Australia","Brazil","China","Japan"]
const INDUSTRIES = ["Healthcare","Finance and Banking","Education","HR and Recruitment","Law Enforcement","E-Commerce","Government","Manufacturing","Other"]
const DATA_TYPES = ["Biometric Data","Personal Data","Health Records","Financial Data","Behavioral Data","Location Data","Childrens Data","Employment Data"]

export default function CompliancePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<string>("form")
  const [form, setForm] = useState<{ai_system_name:string, ai_system_description:string, industry:string, data_types:string[], selected_countries:string[]}>({ ai_system_name:"", ai_system_description:"", industry:"", data_types:[], selected_countries:[] })
  const [results, setResults] = useState<any>(null)
  const [checkId, setCheckId] = useState<string>("")
  const [pdfLoading, setPdfLoading] = useState<boolean>(false)
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading])
  useEffect(() => { setTimeout(()=>setVisible(true),100) }, [])

  const toggle = (list: string[], item: string) => list.includes(item) ? list.filter((i: string)=>i!==item) : [...list, item]

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!form.ai_system_name||!form.ai_system_description||!form.industry) { toast.error("Fill all required fields"); return }
    if (form.selected_countries.length===0) { toast.error("Select at least one country"); return }
    setStep("loading")
    try {
      const res = await complianceAPI.check(form)
      setResults(res.data); setCheckId(res.data.check_id || ''); setStep("results"); toast.success("Analysis complete!")
    } catch (err: any) { toast.error(err.response?.data?.detail||"Analysis failed"); setStep("form") }
  }

  const downloadCertificate = async () => {
    if (!checkId) { toast.error("No check found"); return }
    try {
      const cleanId = checkId.toString().trim()
      const res = await api.get(`/compliance/checks/${cleanId}/certificate`, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }))
      const a = document.createElement("a"); a.href=url; a.download=`compliance_certificate_${cleanId.slice(0,8)}.pdf`; a.click()
      window.URL.revokeObjectURL(url)
      toast.success("Certificate downloaded!")
    } catch (err: any) { 
      console.error("Certificate error:", err)
      toast.error("Certificate failed: " + (err.response?.data?.detail || err.message)) 
    }
  }

  const downloadPDF = async () => {
    setPdfLoading(true)
    try {
      const res = await complianceAPI.pdf(checkId)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href=url; a.download="compliance_report.pdf"; a.click()
      toast.success("PDF downloaded!")
    } catch { toast.error("PDF failed") } finally { setPdfLoading(false) }
  }

  if (loading||!user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)", bottom:0, left:0 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, marginBottom:"0.5rem", background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Compliance Check</h1>
          <p style={{ color:"#94A3B8", fontSize:14 }}>Analyze your AI system against global regulations powered by Groq AI</p>
        </div>

        {step==="form" && (
          <form onSubmit={handleSubmit}>
            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.75rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
              <h2 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.25rem", color:"#4F8EF7", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:24, height:24, borderRadius:"50%", background:"rgba(79,142,247,0.2)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>1</span>
                Describe your AI system
              </h2>
              <div style={{ marginBottom:"1rem" }}><label className="label">System Name *</label><input className="input" placeholder="e.g. HireVision AI, MedBot" value={form.ai_system_name} onChange={(e: any)=>setForm({...form,ai_system_name:e.target.value})} required /></div>
              <div style={{ marginBottom:"1rem" }}><label className="label">Description *</label><textarea className="input" rows={4} placeholder="What does your AI do? What data does it process? Where deployed?" value={form.ai_system_description} onChange={(e: any)=>setForm({...form,ai_system_description:e.target.value})} required style={{ resize:"vertical" }} /></div>
              <div style={{ marginBottom:"1rem" }}><label className="label">Industry *</label><select className="input" value={form.industry} onChange={(e: any)=>setForm({...form,industry:e.target.value})} required style={{ cursor:"pointer" }}><option value="">Select industry</option>{INDUSTRIES.map(i=><option key={i} value={i}>{i}</option>)}</select></div>
              <div>
                <label className="label">Data types used</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
                  {DATA_TYPES.map(dt=>(
                    <button type="button" key={dt} onClick={()=>setForm({...form,data_types:toggle(form.data_types,dt)})} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, cursor:"pointer", background:form.data_types.includes(dt)?"rgba(79,142,247,0.2)":"rgba(0,0,0,0.2)", border:form.data_types.includes(dt)?"1px solid #4F8EF7":"1px solid rgba(255,255,255,0.08)", color:form.data_types.includes(dt)?"#4F8EF7":"#94A3B8", transition:"all 0.2s" }}>
                      {dt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.75rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)", opacity:visible?1:0, transition:"all 0.5s ease 0.2s" }}>
              <h2 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.25rem", color:"#4F8EF7", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:24, height:24, borderRadius:"50%", background:"rgba(79,142,247,0.2)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>2</span>
                Select countries to check
              </h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
                {COUNTRIES.map(c=>(
                  <button type="button" key={c} onClick={()=>setForm({...form,selected_countries:toggle(form.selected_countries,c)})} style={{ padding:"12px 8px", borderRadius:10, fontSize:13, cursor:"pointer", fontWeight:500, background:form.selected_countries.includes(c)?"rgba(79,142,247,0.2)":"rgba(0,0,0,0.2)", border:form.selected_countries.includes(c)?"2px solid #4F8EF7":"1px solid rgba(255,255,255,0.08)", color:form.selected_countries.includes(c)?"#4F8EF7":"#94A3B8", transition:"all 0.2s" }}>
                    {c}
                  </button>
                ))}
              </div>
              <p style={{ fontSize:12, color:"#4F8EF7", marginTop:"0.75rem" }}>{form.selected_countries.length} selected</p>
            </div>

            <button type="submit" style={{ width:"100%", padding:"16px", borderRadius:12, border:"none", cursor:"pointer", fontSize:15, fontWeight:700, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", boxShadow:"0 0 20px rgba(79,142,247,0.3)", transition:"all 0.3s", opacity:visible?1:0, transitionDelay:"0.3s" }}>
              Run Compliance Check
            </button>
          </form>
        )}

        {step==="loading" && (
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"4rem", textAlign:"center", backdropFilter:"blur(10px)" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", border:"3px solid rgba(79,142,247,0.2)", borderTop:"3px solid #4F8EF7", margin:"0 auto 1.5rem", animation:"spin 1s linear infinite" }} />
            <h2 style={{ fontSize:"1.3rem", fontWeight:600, marginBottom:"0.75rem" }}>Analyzing compliance...</h2>
            <p style={{ color:"#94A3B8", fontSize:14 }}>Groq AI is checking {form.selected_countries.join(", ")} regulations. Takes 20-40 seconds.</p>
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:"1.5rem" }}>
              {form.selected_countries.map(c=>(
                <span key={c} style={{ fontSize:11, padding:"4px 12px", borderRadius:20, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.2)", color:"#4F8EF7", animation:"shimmer 2s ease-in-out infinite" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {step==="results" && results && (
          <div>
            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"1.75rem", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"2rem", backdropFilter:"blur(10px)" }}>
              <div style={{ textAlign:"center", minWidth:110 }}>
                <div style={{ fontSize:"3.5rem", fontWeight:800, fontFamily:"monospace", background:results.overall_score>70?"linear-gradient(135deg,#22C55E,#16A34A)":results.overall_score>40?"linear-gradient(135deg,#F59E0B,#D97706)":"linear-gradient(135deg,#EF4444,#DC2626)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{results.overall_score}</div>
                <div style={{ fontSize:12, color:"#64748B" }}>/ 100 score</div>
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:"1.2rem", fontWeight:700, marginBottom:8 }}>{form.ai_system_name}</h2>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                  <span className={results.status==="Compliant"?"badge-compliant":results.status==="Non-Compliant"?"badge-non":"badge-partial"}>{results.status}</span>
                  <span style={{ fontSize:13, color:"#94A3B8" }}>Risk: <strong style={{ color:results.overall_risk==="High"?"#EF4444":results.overall_risk==="Medium"?"#F59E0B":"#22C55E" }}>{results.overall_risk}</strong></span>
                  <span style={{ fontSize:13, color:"#94A3B8" }}>{results.critical_issues_count} issues found</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:10, flexDirection:"column" }}>
                <button onClick={downloadPDF} disabled={pdfLoading} style={{ padding:"12px 20px", borderRadius:10, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", whiteSpace:"nowrap" }}>{pdfLoading?"Generating...":"Download PDF"}</button>
                <div style={{ display:"flex", gap:8, flexDirection:"column" }}>
                    <button onClick={downloadPDF} disabled={pdfLoading} style={{ padding:"10px 16px", borderRadius:10, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", whiteSpace:"nowrap" }}>{pdfLoading?"Generating...":"Download PDF Report"}</button>
                    <button onClick={downloadCertificate} style={{ padding:"10px 16px", borderRadius:10, border:"1px solid #22C55E", background:"rgba(34,197,94,0.08)", color:"#22C55E", cursor:"pointer", fontSize:13, fontWeight:500, whiteSpace:"nowrap" }}>Download Certificate</button>
                  </div>
                <Link href={"/chat?check_id="+checkId} style={{ display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:"#94A3B8", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 16px", fontSize:13, background:"rgba(0,0,0,0.2)" }}>Ask AI about this</Link>
              </div>
            </div>

            {Object.entries(results.country_results).map(([country,r]: [string, any])=>(
              <div key={country} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", marginBottom:"1rem", backdropFilter:"blur(10px)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                  <div>
                    <h3 style={{ fontSize:"1rem", fontWeight:700 }}>{r.emoji} {country}</h3>
                    <p style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{r.regulation_name}</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontFamily:"monospace", fontSize:"1.8rem", fontWeight:700, color:r.compliance_score>70?"#22C55E":r.compliance_score>40?"#F59E0B":"#EF4444" }}>{r.compliance_score}</span>
                    <span className={r.status==="Compliant"?"badge-compliant":r.status==="Non-Compliant"?"badge-non":"badge-partial"}>{r.status}</span>
                  </div>
                </div>
                <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.7, marginBottom:"1rem", background:"rgba(0,0,0,0.15)", borderRadius:8, padding:"0.75rem" }}>{r.full_analysis}</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                  <div style={{ background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:10, padding:"1rem" }}>
                    <h4 style={{ fontSize:12, color:"#EF4444", fontWeight:600, marginBottom:8 }}>Issues Found</h4>
                    {r.issues?.map((issue: string, i: number)=>(<div key={i} style={{ fontSize:12, color:"#94A3B8", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #EF4444", lineHeight:1.5 }}>{issue}</div>))}
                  </div>
                  <div style={{ background:"rgba(34,197,94,0.05)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:10, padding:"1rem" }}>
                    <h4 style={{ fontSize:12, color:"#22C55E", fontWeight:600, marginBottom:8 }}>Recommendations</h4>
                    {r.recommendations?.map((rec: string, i: number)=>(<div key={i} style={{ fontSize:12, color:"#94A3B8", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #22C55E", lineHeight:1.5 }}>{rec}</div>))}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={()=>{setStep("form");setResults(null)}} style={{ width:"100%", marginTop:"1rem", padding:"14px", borderRadius:12, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", cursor:"pointer", fontSize:14, transition:"all 0.2s" }}>
              Run another check
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
