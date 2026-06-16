
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import api from "@/lib/api"
import Link from "next/link"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [docs, setDocs] = useState<any[]>([])
  const [pdfs, setPdfs] = useState<any[]>([])
  const [checks, setChecks] = useState<any[]>([])
  const [tab, setTab] = useState("checks")
  const [visible, setVisible] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => {
    if (user) {
      setTimeout(() => setVisible(true), 100)
      loadAll()
    }
  }, [user])

  const loadAll = async () => {
    try {
      const [docsRes, pdfsRes, checksRes] = await Promise.all([
        api.get("/documents/list"),
        api.get("/documents/pdfs"),
        api.get("/compliance/checks")
      ])
      setDocs(docsRes.data.documents || [])
      setPdfs(pdfsRes.data.pdfs || [])
      setChecks(checksRes.data || [])
    } catch (err: any) { console.error(err) }
  }

  const deleteDoc = async (id: string) => {
    try {
      await api.delete("/documents/" + id)
      setDocs(prev => prev.filter((d: any) => d.id !== id))
      toast.success("Deleted!")
    } catch { toast.error("Delete failed") }
  }

  const downloadPDF = async (pdf: any) => {
    try {
      const res = await api.get("/documents/pdfs/" + pdf.id + "/download", { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url; a.download = pdf.filename; a.click()
      toast.success("Downloaded!")
    } catch { toast.error("Download failed") }
  }

  const downloadCertificate = async (checkId: string, name: string) => {
    try {
      const res = await api.get("/compliance/checks/" + checkId + "/certificate", { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }))
      const a = document.createElement("a"); a.href = url; a.download = name + "_certificate.pdf"; a.click()
      window.URL.revokeObjectURL(url)
      toast.success("Certificate downloaded!")
    } catch { toast.error("Certificate failed") }
  }

  const downloadCheckPDF = async (checkId: string, name: string) => {
    try {
      const res = await api.get("/compliance/checks/" + checkId + "/pdf", { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url; a.download = name + "_report.pdf"; a.click()
      toast.success("PDF downloaded!")
    } catch { toast.error("PDF failed") }
  }

  if (loading || !user) return null

  const TABS = [
    { id: "checks", label: "Compliance Checks", count: checks.length, icon: "🔍" },
    { id: "pdfs", label: "Saved PDFs", count: pdfs.length, icon: "📄" },
    { id: "docs", label: "Uploaded Documents", count: docs.length, icon: "📁" },
  ]

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>My History</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>All your compliance checks, PDFs and uploaded documents</p>
        </div>

        {/* TABS */}
        <div style={{ display:"flex", gap:8, marginBottom:"2rem", background:"rgba(17,34,64,0.8)", padding:4, borderRadius:12, border:"1px solid rgba(255,255,255,0.06)", width:"fit-content" }}>
          {TABS.map((t: any) => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"10px 20px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, background:tab===t.id?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"transparent", color:tab===t.id?"#fff":"#94A3B8", transition:"all 0.2s", display:"flex", alignItems:"center", gap:6 }}>
              {t.icon} {t.label} <span style={{ fontSize:11, background:"rgba(255,255,255,0.1)", borderRadius:10, padding:"1px 7px" }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* COMPLIANCE CHECKS TAB */}
        {tab === "checks" && (
          <div>
            {checks.length === 0 ? (
              <div style={{ textAlign:"center", padding:"4rem", color:"#64748B" }}>
                <div style={{ fontSize:48, marginBottom:"1rem" }}>🔍</div>
                <p style={{ marginBottom:"1rem" }}>No compliance checks yet</p>
                <Link href="/compliance" style={{ color:"#4F8EF7", textDecoration:"none" }}>Run your first check</Link>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {checks.map((c: any) => (
                  <div key={c.id} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", gap:"1.5rem", backdropFilter:"blur(10px)", transition:"all 0.2s" }}>
                    <div style={{ width:60, height:60, borderRadius:12, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontFamily:"monospace", fontSize:"1.5rem", fontWeight:700, color:c.overall_score>70?"#22C55E":c.overall_score>40?"#F59E0B":"#EF4444" }}>{c.overall_score ?? "-"}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{c.ai_system_name}</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                        <span className={c.status==="Compliant"?"badge-compliant":c.status==="Non-Compliant"?"badge-non":"badge-partial"}>{c.status || "Pending"}</span>
                        <span style={{ fontSize:12, color:"#64748B" }}>{(c.selected_countries||[]).join(", ")}</span>
                        <span style={{ fontSize:12, color:"#64748B" }}>{new Date(c.created_at).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>downloadCheckPDF(c.id, c.ai_system_name)} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:12, fontWeight:500, whiteSpace:"nowrap" }}>Download PDF</button>
                      <button onClick={()=>downloadCertificate(c.id, c.ai_system_name)} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #22C55E", background:"rgba(34,197,94,0.08)", color:"#22C55E", cursor:"pointer", fontSize:12, fontWeight:500, whiteSpace:"nowrap" }}>Certificate</button>
                      <Link href={"/chat?check_id="+c.id} style={{ padding:"8px 16px", borderRadius:8, textDecoration:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#94A3B8", fontSize:12, display:"flex", alignItems:"center" }}>Ask AI</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PDFs TAB */}
        {tab === "pdfs" && (
          <div>
            {pdfs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"4rem", color:"#64748B" }}>
                <div style={{ fontSize:48, marginBottom:"1rem" }}>📄</div>
                <p style={{ marginBottom:"1rem" }}>No saved PDFs yet</p>
                <Link href="/compliance" style={{ color:"#4F8EF7", textDecoration:"none" }}>Run a compliance check to generate PDF</Link>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {pdfs.map((p: any) => (
                  <div key={p.id} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem", backdropFilter:"blur(10px)" }}>
                    <div style={{ fontSize:32, marginBottom:"0.75rem" }}>📄</div>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.filename}</div>
                    <div style={{ fontSize:12, color:"#64748B", marginBottom:"1rem" }}>{new Date(p.created_at).toLocaleDateString("en-IN")}</div>
                    <button onClick={()=>downloadPDF(p)} style={{ width:"100%", padding:"9px", borderRadius:8, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:13, fontWeight:500 }}>Download PDF</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {tab === "docs" && (
          <div>
            {docs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"4rem", color:"#64748B" }}>
                <div style={{ fontSize:48, marginBottom:"1rem" }}>📁</div>
                <p style={{ marginBottom:"1rem" }}>No uploaded documents yet</p>
                <Link href="/upload" style={{ color:"#4F8EF7", textDecoration:"none" }}>Upload your first document</Link>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {docs.map((d: any) => (
                  <div key={d.id} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", gap:"1.5rem", backdropFilter:"blur(10px)" }}>
                    <div style={{ fontSize:32, flexShrink:0 }}>📁</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{d.filename}</div>
                      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                        <span style={{ fontSize:12, color:"#64748B" }}>{d.word_count} words</span>
                        <span style={{ fontSize:12, color:"#64748B" }}>{d.suggested_industry}</span>
                        <span style={{ fontSize:12, color:"#64748B" }}>{new Date(d.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                      <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                        {(d.suggested_data_types||[]).map((t: string) => (
                          <span key={t} style={{ fontSize:11, padding:"2px 8px", borderRadius:10, background:"rgba(79,142,247,0.1)", color:"#4F8EF7", border:"1px solid rgba(79,142,247,0.2)" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <Link href="/upload" style={{ padding:"8px 16px", borderRadius:8, textDecoration:"none", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontSize:12, fontWeight:500, display:"flex", alignItems:"center" }}>Re-analyze</Link>
                      <button onClick={()=>deleteDoc(d.id)} style={{ padding:"8px 14px", borderRadius:8, border:"1px solid rgba(239,68,68,0.3)", background:"transparent", color:"#EF4444", cursor:"pointer", fontSize:12 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
