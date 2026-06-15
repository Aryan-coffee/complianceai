"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { complianceAPI } from "@/lib/api"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import Link from "next/link"
const COUNTRIES = ["EU","India","USA","UK","Canada","Singapore","Australia","Brazil","China","Japan"]
const INDUSTRIES = ["Healthcare","Finance and Banking","Education","HR and Recruitment","Law Enforcement","E-Commerce","Government","Manufacturing","Other"]
const DATA_TYPES = ["Biometric Data","Personal Data","Health Records","Financial Data","Behavioral Data","Location Data","Childrens Data","Employment Data"]
export default function CompliancePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState("form")
  const [form, setForm] = useState({ ai_system_name:"", ai_system_description:"", industry:"", data_types:[] as string[], selected_countries:[] as string[] })
  const [results, setResults] = useState<any>(null)
  const [checkId, setCheckId] = useState("")
  const [pdfLoading, setPdfLoading] = useState(false)
  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading])
  const toggle = (list: string[], item: string) => list.includes(item) ? list.filter(i => i !== item) : [...list, item]
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ai_system_name || !form.ai_system_description || !form.industry) { toast.error("Fill all required fields"); return }
    if (form.selected_countries.length === 0) { toast.error("Select at least one country"); return }
    setStep("loading")
    try {
      const res = await complianceAPI.check(form)
      setResults(res.data); setCheckId(res.data.check_id); setStep("results"); toast.success("Analysis complete!")
    } catch (err: any) { toast.error(err.response?.data?.detail || "Analysis failed"); setStep("form") }
  }
  const downloadPDF = async () => {
    setPdfLoading(true)
    try {
      const res = await complianceAPI.pdf(checkId)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url; a.download = "compliance_" + checkId.slice(0,8) + ".pdf"; a.click()
      toast.success("PDF downloaded!")
    } catch { toast.error("PDF failed") } finally { setPdfLoading(false) }
  }
  if (loading || !user) return null
  return (
    <div style={{ minHeight:"100vh", background:"#0A1628" }}>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"6rem 2rem 2rem" }}>
        <h1 style={{ fontSize:"1.8rem", fontWeight:700, marginBottom:"0.5rem" }}>Compliance Check</h1>
        <p style={{ color:"#94A3B8", marginBottom:"2rem", fontSize:14 }}>Analyze your AI system against global regulations powered by Gemini AI</p>
        {step === "form" && (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom:"1.5rem" }}>
              <h2 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.25rem", color:"#4F8EF7" }}>Step 1 - Describe your AI system</h2>
              <div style={{ marginBottom:"1rem" }}><label className="label">System Name</label><input className="input" placeholder="e.g. HireVision AI" value={form.ai_system_name} onChange={e => setForm({...form, ai_system_name: e.target.value})} required /></div>
              <div style={{ marginBottom:"1rem" }}><label className="label">Description</label><textarea className="input" rows={4} placeholder="What does your AI do? What data does it use? Where deployed?" value={form.ai_system_description} onChange={e => setForm({...form, ai_system_description: e.target.value})} required style={{ resize:"vertical" }} /></div>
              <div style={{ marginBottom:"1rem" }}><label className="label">Industry</label><select className="input" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} required style={{ cursor:"pointer" }}><option value="">Select industry</option>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
              <div><label className="label">Data types used</label><div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>{DATA_TYPES.map(dt => (<button type="button" key={dt} onClick={() => setForm({...form, data_types: toggle(form.data_types, dt)})} style={{ padding:"6px 14px", borderRadius:8, fontSize:12, cursor:"pointer", background: form.data_types.includes(dt) ? "rgba(79,142,247,0.2)" : "#0A1628", border: form.data_types.includes(dt) ? "1px solid #4F8EF7" : "1px solid rgba(255,255,255,0.08)", color: form.data_types.includes(dt) ? "#4F8EF7" : "#94A3B8" }}>{dt}</button>))}</div></div>
            </div>
            <div className="card" style={{ marginBottom:"1.5rem" }}>
              <h2 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1.25rem", color:"#4F8EF7" }}>Step 2 - Select countries</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>{COUNTRIES.map(c => (<button type="button" key={c} onClick={() => setForm({...form, selected_countries: toggle(form.selected_countries, c)})} style={{ padding:"10px", borderRadius:10, fontSize:13, cursor:"pointer", background: form.selected_countries.includes(c) ? "rgba(79,142,247,0.2)" : "#0A1628", border: form.selected_countries.includes(c) ? "1px solid #4F8EF7" : "1px solid rgba(255,255,255,0.08)", color: form.selected_countries.includes(c) ? "#4F8EF7" : "#94A3B8" }}>{c}</button>))}</div>
              <p style={{ fontSize:12, color:"#4F8EF7", marginTop:"0.75rem" }}>{form.selected_countries.length} selected</p>
            </div>
            <button className="btn-primary" type="submit" style={{ width:"100%", padding:"16px", fontSize:15, fontWeight:600 }}>Run Compliance Check</button>
          </form>
        )}
        {step === "loading" && (
          <div className="card" style={{ textAlign:"center", padding:"4rem" }}>
            <h2 style={{ fontSize:"1.3rem", fontWeight:600, marginBottom:"0.75rem" }}>Analyzing compliance...</h2>
            <p style={{ color:"#94A3B8", fontSize:14 }}>Gemini AI is checking {form.selected_countries.join(", ")} regulations. Takes 20-40 seconds.</p>
          </div>
        )}
        {step === "results" && results && (
          <div>
            <div className="card" style={{ marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"2rem" }}>
              <div style={{ textAlign:"center", minWidth:100 }}>
                <div style={{ fontSize:"3rem", fontWeight:700, fontFamily:"monospace", color: results.overall_score > 70 ? "#22C55E" : results.overall_score > 40 ? "#F59E0B" : "#EF4444" }}>{results.overall_score}</div>
                <div style={{ fontSize:12, color:"#64748B" }}>/ 100</div>
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:"1.1rem", fontWeight:600, marginBottom:8 }}>{form.ai_system_name}</h2>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                  <span className={results.status === "Compliant" ? "badge-compliant" : results.status === "Non-Compliant" ? "badge-non" : "badge-partial"}>{results.status}</span>
                  <span style={{ fontSize:13, color:"#94A3B8" }}>Risk: {results.overall_risk}</span>
                  <span style={{ fontSize:13, color:"#94A3B8" }}>{results.critical_issues_count} issues</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:10, flexDirection:"column" }}>
                <button onClick={downloadPDF} disabled={pdfLoading} className="btn-primary" style={{ whiteSpace:"nowrap" }}>{pdfLoading ? "Generating..." : "Download PDF"}</button>
                <Link href={"/chat?check_id=" + checkId} style={{ display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:"#94A3B8", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 16px", fontSize:13 }}>Ask AI</Link>
              </div>
            </div>
            {Object.entries(results.country_results).map(([country, result]: any) => (
              <div key={country} className="card" style={{ marginBottom:"1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                  <div><h3 style={{ fontSize:"1rem", fontWeight:600 }}>{result.emoji} {country}</h3><p style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{result.regulation_name}</p></div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontFamily:"monospace", fontSize:"1.5rem", fontWeight:700, color: result.compliance_score > 70 ? "#22C55E" : result.compliance_score > 40 ? "#F59E0B" : "#EF4444" }}>{result.compliance_score}</span>
                    <span className={result.status === "Compliant" ? "badge-compliant" : result.status === "Non-Compliant" ? "badge-non" : "badge-partial"}>{result.status}</span>
                  </div>
                </div>
                <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.7, marginBottom:"1rem" }}>{result.full_analysis}</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                  <div><h4 style={{ fontSize:12, color:"#EF4444", fontWeight:600, marginBottom:8 }}>Issues Found</h4>{result.issues?.map((issue: string, i: number) => (<div key={i} style={{ fontSize:12, color:"#94A3B8", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #EF4444", lineHeight:1.5 }}>{issue}</div>))}</div>
                  <div><h4 style={{ fontSize:12, color:"#22C55E", fontWeight:600, marginBottom:8 }}>Recommendations</h4>{result.recommendations?.map((rec: string, i: number) => (<div key={i} style={{ fontSize:12, color:"#94A3B8", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #22C55E", lineHeight:1.5 }}>{rec}</div>))}</div>
                </div>
              </div>
            ))}
            <button onClick={() => { setStep("form"); setResults(null) }} className="btn-outline" style={{ width:"100%", marginTop:"1rem" }}>Run another check</button>
          </div>
        )}
      </div>
    </div>
  )
}
