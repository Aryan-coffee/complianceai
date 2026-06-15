
"use client"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import Link from "next/link"
import api from "@/lib/api"

const COUNTRIES = ["EU","India","USA","UK","Canada","Singapore","Australia","Brazil","China","Japan"]

export default function UploadPage() {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [file, setFile] = useState<any>(null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [analyzed, setAnalyzed] = useState<any>(null)
  const [countries, setCountries] = useState<string[]>([])
  const [running, setRunning] = useState<boolean>(false)
  const [results, setResults] = useState<any>(null)
  const [drag, setDrag] = useState<boolean>(false)
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => { setTimeout(()=>setVisible(true),100) }, [])

  const toggle = (list: string[], item: string) => list.includes(item) ? list.filter((i: string)=>i!==item) : [...list, item]

  const handleFile = (f) => {
    const allowed = [".pdf",".doc",".docx",".txt"]
    const ext = "." + f.name.split(".").pop().toLowerCase()
    if (!allowed.includes(ext)) { toast.error("Only PDF, DOC, DOCX, TXT allowed"); return }
    if (f.size > 10*1024*1024) { toast.error("Max file size 10MB"); return }
    setFile(f); setAnalyzed(null); setResults(null)
  }

  const uploadFile = async () => {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData(); form.append("file", file)
      const res = await api.post("/upload/analyze", form, { headers: {"Content-Type":"multipart/form-data"} })
      setAnalyzed(res.data); toast.success("Document analyzed!")
    } catch (err: any) { toast.error(err.response?.data?.detail||"Upload failed") } finally { setUploading(false) }
  }

  const runCheck = async () => {
    if (!analyzed||countries.length===0) { toast.error("Select at least one country"); return }
    setRunning(true)
    try {
      const res = await api.post("/compliance/check", { ai_system_name:analyzed.suggested_system_name, ai_system_description:analyzed.suggested_description, industry:analyzed.suggested_industry, data_types:analyzed.suggested_data_types, selected_countries:countries, deployment_regions:countries })
      setResults(res.data); toast.success("Compliance check complete!")
    } catch (err: any) { toast.error(err.response?.data?.detail||"Check failed") } finally { setRunning(false) }
  }

  const downloadPDF = async () => {
    if (!results?.check_id) return
    try {
      const res = await api.get("/compliance/checks/"+results.check_id+"/pdf", {responseType:"blob"})
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href=url; a.download="compliance_report.pdf"; a.click()
      toast.success("PDF downloaded!")
    } catch { toast.error("PDF failed") }
  }

  if (!user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)", bottom:0, left:0 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, marginBottom:"0.5rem", background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Document Compliance Check</h1>
          <p style={{ color:"#94A3B8", fontSize:14 }}>Upload any AI policy or system description — our AI will automatically analyze compliance</p>
        </div>

        {!analyzed ? (
          <div style={{ opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
            <div onDragOver={(e: any)=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={(e: any)=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}} onClick={()=>fileRef.current?.click()}
              style={{ border:drag?"2px solid #4F8EF7":"2px dashed rgba(79,142,247,0.3)", borderRadius:20, padding:"5rem 2rem", textAlign:"center", cursor:"pointer", background:drag?"rgba(79,142,247,0.08)":"rgba(17,34,64,0.5)", transition:"all 0.2s", marginBottom:"1.5rem", backdropFilter:"blur(10px)", boxShadow:drag?"0 0 30px rgba(79,142,247,0.2)":"none" }}>
              <div style={{ fontSize:80, marginBottom:"1rem", animation:drag?"pulse 0.5s ease infinite":"none" }}>📄</div>
              <h3 style={{ fontSize:"1.3rem", fontWeight:600, marginBottom:"0.5rem" }}>{file ? file.name : "Drop your document here"}</h3>
              <p style={{ color:"#94A3B8", fontSize:13 }}>{file ? (file.size/1024).toFixed(1)+" KB" : "or click to browse — PDF, DOC, DOCX, TXT (max 10MB)"}</p>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display:"none" }} onChange={(e: any)=>e.target.files?.[0]&&handleFile(e.target.files[0])} />
            </div>

            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.1)", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)" }}>
              <h4 style={{ fontSize:13, color:"#4F8EF7", marginBottom:"1rem", fontWeight:600 }}>What documents work best?</h4>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                {["AI System Design Documents","Privacy Policy / Data Policy","Terms of Service with AI","Technical Architecture Docs","AI Ethics Policy","Product Requirement Docs","Data Processing Agreements","Internal AI Guidelines"].map(d=>(
                  <div key={d} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#94A3B8" }}><span style={{ color:"#22C55E" }}>✓</span>{d}</div>
                ))}
              </div>
            </div>

            {file && (
              <button onClick={uploadFile} disabled={uploading} style={{ width:"100%", padding:"16px", borderRadius:12, border:"none", cursor:"pointer", fontSize:15, fontWeight:700, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", boxShadow:"0 0 20px rgba(79,142,247,0.3)", transition:"all 0.3s" }}>
                {uploading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", display:"inline-block", animation:"spin 1s linear infinite" }} />
                    Analyzing document...
                  </span>
                ) : "Analyze Document"}
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)", boxShadow:"0 0 30px rgba(79,142,247,0.1)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
                <div>
                  <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:4 }}>Document Analyzed</h3>
                  <p style={{ fontSize:13, color:"#64748B" }}>{analyzed.filename} — {analyzed.word_count} words</p>
                </div>
                <button onClick={()=>{setFile(null);setAnalyzed(null);setResults(null)}} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 12px", color:"#94A3B8", cursor:"pointer", fontSize:12 }}>Upload new</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
                <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"0.75rem" }}><div style={{ fontSize:10, color:"#64748B", marginBottom:4, textTransform:"uppercase" }}>System Name</div><div style={{ fontSize:14, fontWeight:600 }}>{analyzed.suggested_system_name}</div></div>
                <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"0.75rem" }}><div style={{ fontSize:10, color:"#64748B", marginBottom:4, textTransform:"uppercase" }}>Industry</div><div style={{ fontSize:14, fontWeight:600 }}>{analyzed.suggested_industry}</div></div>
                <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"0.75rem" }}><div style={{ fontSize:10, color:"#64748B", marginBottom:4, textTransform:"uppercase" }}>Word Count</div><div style={{ fontSize:14, fontWeight:600 }}>{analyzed.word_count}</div></div>
              </div>
              <div style={{ marginBottom:"1rem" }}>
                <div style={{ fontSize:10, color:"#64748B", marginBottom:6, textTransform:"uppercase" }}>Detected Topics</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {analyzed.detected_topics.map(t=>(<span key={t} style={{ padding:"4px 12px", borderRadius:20, background:"rgba(79,142,247,0.15)", color:"#4F8EF7", fontSize:12, fontWeight:500, border:"1px solid rgba(79,142,247,0.2)" }}>{t}</span>))}
                </div>
              </div>
            </div>

            {!results && (
              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.75rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)" }}>
                <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Select Countries to Check</h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:"1rem" }}>
                  {COUNTRIES.map(c=>(
                    <button type="button" key={c} onClick={()=>setCountries(toggle(countries,c))} style={{ padding:"10px", borderRadius:10, fontSize:13, cursor:"pointer", fontWeight:500, background:countries.includes(c)?"rgba(79,142,247,0.2)":"rgba(0,0,0,0.2)", border:countries.includes(c)?"2px solid #4F8EF7":"1px solid rgba(255,255,255,0.06)", color:countries.includes(c)?"#4F8EF7":"#94A3B8", transition:"all 0.2s" }}>{c}</button>
                  ))}
                </div>
                <p style={{ fontSize:12, color:"#4F8EF7", marginBottom:"1rem" }}>{countries.length} selected</p>
                <button onClick={runCheck} disabled={running||countries.length===0} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:"pointer", fontSize:15, fontWeight:700, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", opacity:countries.length===0?0.5:1, boxShadow:"0 0 20px rgba(79,142,247,0.3)" }}>
                  {running ? (
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                      <span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", display:"inline-block", animation:"spin 1s linear infinite" }} />
                      Running compliance check...
                    </span>
                  ) : "Run Compliance Check"}
                </button>
              </div>
            )}

            {results && (
              <div>
                <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"1.75rem", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"2rem", backdropFilter:"blur(10px)" }}>
                  <div style={{ textAlign:"center", minWidth:110 }}>
                    <div style={{ fontSize:"3.5rem", fontWeight:800, fontFamily:"monospace", background:results.overall_score>70?"linear-gradient(135deg,#22C55E,#16A34A)":results.overall_score>40?"linear-gradient(135deg,#F59E0B,#D97706)":"linear-gradient(135deg,#EF4444,#DC2626)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{results.overall_score}</div>
                    <div style={{ fontSize:12, color:"#64748B" }}>/ 100 score</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <h2 style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:8 }}>{analyzed.suggested_system_name}</h2>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      <span className={results.status==="Compliant"?"badge-compliant":results.status==="Non-Compliant"?"badge-non":"badge-partial"}>{results.status}</span>
                      <span style={{ fontSize:13, color:"#94A3B8" }}>Risk: {results.overall_risk}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, flexDirection:"column" }}>
                    <button onClick={downloadPDF} style={{ padding:"12px 20px", borderRadius:10, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", whiteSpace:"nowrap" }}>Download PDF</button>
                    <Link href="/chat" style={{ textDecoration:"none", color:"#94A3B8", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 16px", fontSize:13, textAlign:"center" }}>Ask AI</Link>
                  </div>
                </div>

                {Object.entries(results.country_results).map(([country,r]: [string, any])=>(
                  <div key={country} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", marginBottom:"1rem", backdropFilter:"blur(10px)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                      <div><h3 style={{ fontSize:"1rem", fontWeight:700 }}>{r.emoji} {country}</h3><p style={{ fontSize:12, color:"#64748B" }}>{r.regulation_name}</p></div>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontFamily:"monospace", fontSize:"1.8rem", fontWeight:700, color:r.compliance_score>70?"#22C55E":r.compliance_score>40?"#F59E0B":"#EF4444" }}>{r.compliance_score}</span>
                        <span className={r.status==="Compliant"?"badge-compliant":r.status==="Non-Compliant"?"badge-non":"badge-partial"}>{r.status}</span>
                      </div>
                    </div>
                    <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.7, marginBottom:"1rem" }}>{r.full_analysis}</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                      <div style={{ background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:10, padding:"1rem" }}>
                        <h4 style={{ fontSize:12, color:"#EF4444", fontWeight:600, marginBottom:8 }}>Issues</h4>
                        {r.issues?.map((issue: string, i: number)=>(<div key={i} style={{ fontSize:12, color:"#94A3B8", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #EF4444", lineHeight:1.5 }}>{issue}</div>))}
                      </div>
                      <div style={{ background:"rgba(34,197,94,0.05)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:10, padding:"1rem" }}>
                        <h4 style={{ fontSize:12, color:"#22C55E", fontWeight:600, marginBottom:8 }}>Fixes</h4>
                        {r.recommendations?.map((rec: string, i: number)=>(<div key={i} style={{ fontSize:12, color:"#94A3B8", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #22C55E", lineHeight:1.5 }}>{rec}</div>))}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>{setResults(null);setCountries([])}} style={{ width:"100%", marginTop:"1rem", padding:"14px", borderRadius:12, background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", cursor:"pointer", fontSize:14 }}>Check different countries</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
