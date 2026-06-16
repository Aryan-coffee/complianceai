
"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import api from "@/lib/api"

const COUNTRIES = ["EU","India","USA","UK","Canada","Singapore","Australia","Brazil","China","Japan"]

export default function BulkCheckPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [systems, setSystems] = useState<any[]>([])
  const [countries, setCountries] = useState<string[]>(["EU","India"])
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const toggle = (list: string[], item: string) => list.includes(item) ? list.filter((i: string) => i !== item) : [...list, item]

  const handleCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      const text = e.target.result
      const lines = text.split("\n").filter((l: string) => l.trim())
      const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase())
      const parsed = lines.slice(1).map((line: string) => {
        const vals = line.split(",")
        return {
          name: vals[headers.indexOf("name")] || vals[0] || "Unknown",
          description: vals[headers.indexOf("description")] || vals[1] || "AI system",
          industry: vals[headers.indexOf("industry")] || vals[2] || "Other",
          data_types: (vals[headers.indexOf("data_types")] || vals[3] || "Personal Data").split(";"),
        }
      }).filter((s: any) => s.name && s.name !== "name")
      setSystems(parsed)
      toast.success(`${parsed.length} systems loaded!`)
    }
    reader.readAsText(file)
  }

  const runBulk = async () => {
    if (systems.length === 0) { toast.error("Upload CSV first"); return }
    if (countries.length === 0) { toast.error("Select countries"); return }
    setRunning(true); setResults([]); setProgress(0)
    const allResults: any[] = []
    for (let i = 0; i < systems.length; i++) {
      const sys = systems[i]
      try {
        const res = await api.post("/compliance/check", {
          ai_system_name: sys.name,
          ai_system_description: sys.description,
          industry: sys.industry,
          data_types: sys.data_types,
          selected_countries: countries,
          deployment_regions: countries
        })
        allResults.push({ ...sys, result: res.data, status: "done" })
      } catch (err: any) {
        allResults.push({ ...sys, result: null, status: "error", error: err.message })
      }
      setProgress(Math.round(((i + 1) / systems.length) * 100))
      setResults([...allResults])
    }
    setRunning(false)
    toast.success(`Bulk check complete! ${allResults.length} systems analyzed.`)
  }

  const downloadCSVReport = () => {
    const rows = [["System Name","Industry","Overall Score","Status","Risk","Countries"]]
    results.forEach((r: any) => {
      if (r.result) {
        rows.push([r.name, r.industry, r.result.overall_score, r.result.overall_status, r.result.overall_risk, countries.join(";")])
      }
    })
    const csv = rows.map((r: any) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "bulk_compliance_report.csv"; a.click()
    toast.success("CSV downloaded!")
  }

  if (loading || !user) return null

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-100, right:-100 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, transition:"all 0.5s ease" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Bulk Compliance Check</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Upload CSV with multiple AI systems — check all at once</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"1.5rem", opacity:visible?1:0, transition:"all 0.5s ease 0.1s" }}>
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Step 1 — Upload CSV</h3>
            <div onClick={() => fileRef.current?.click()} style={{ border:"2px dashed rgba(79,142,247,0.3)", borderRadius:12, padding:"2rem", textAlign:"center", cursor:"pointer", background:"rgba(0,0,0,0.2)", marginBottom:"1rem" }}>
              <div style={{ fontSize:40, marginBottom:"0.5rem" }}>📊</div>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>Drop CSV file here</div>
              <div style={{ fontSize:12, color:"#64748B" }}>or click to browse</div>
              <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={(e: any) => e.target.files?.[0] && handleCSV(e.target.files[0])} />
            </div>
            <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:"1rem", fontSize:12, color:"#64748B", fontFamily:"monospace" }}>
              <div style={{ color:"#4F8EF7", marginBottom:4, fontSize:11 }}>CSV FORMAT:</div>
              name,description,industry,data_types<br/>
              HireAI,AI hiring tool,HR and Recruitment,Biometric Data;Personal Data<br/>
              MedBot,Medical diagnosis,Healthcare,Health Records
            </div>
            {systems.length > 0 && (
              <div style={{ marginTop:"1rem", padding:"10px 14px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:10, fontSize:13, color:"#22C55E" }}>
                ✓ {systems.length} systems loaded
              </div>
            )}
          </div>

          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:16, padding:"1.5rem", backdropFilter:"blur(10px)" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Step 2 — Select Countries</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:"1rem" }}>
              {COUNTRIES.map((c: string) => (
                <button key={c} onClick={() => setCountries(toggle(countries, c))} style={{ padding:"8px", borderRadius:8, fontSize:12, cursor:"pointer", fontWeight:500, background:countries.includes(c)?"rgba(79,142,247,0.2)":"rgba(0,0,0,0.2)", border:countries.includes(c)?"1px solid #4F8EF7":"1px solid rgba(255,255,255,0.06)", color:countries.includes(c)?"#4F8EF7":"#94A3B8", transition:"all 0.2s" }}>{c}</button>
              ))}
            </div>
            <p style={{ fontSize:12, color:"#64748B", marginBottom:"1rem" }}>{countries.length} countries selected</p>
            <button onClick={runBulk} disabled={running || systems.length === 0 || countries.length === 0} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", opacity:(running||systems.length===0||countries.length===0)?0.5:1, boxShadow:"0 0 20px rgba(79,142,247,0.3)" }}>
              {running ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", display:"inline-block", animation:"spin 1s linear infinite" }} />
                  Checking {progress}%...
                </span>
              ) : `Run Bulk Check (${systems.length} systems)`}
            </button>
          </div>
        </div>

        {running && (
          <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem", backdropFilter:"blur(10px)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.75rem" }}>
              <span style={{ fontSize:14, fontWeight:500 }}>Progress</span>
              <span style={{ fontSize:14, color:"#4F8EF7", fontWeight:600 }}>{progress}%</span>
            </div>
            <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#4F8EF7,#7C3AED)", borderRadius:4, transition:"width 0.3s ease" }} />
            </div>
            <p style={{ fontSize:12, color:"#64748B", marginTop:"0.5rem" }}>Checked {results.length} of {systems.length} systems...</p>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ opacity:visible?1:0, transition:"all 0.5s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <h3 style={{ fontSize:"1rem", fontWeight:600 }}>Results — {results.length} systems</h3>
              <button onClick={downloadCSVReport} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#22C55E,#16A34A)", color:"#fff", fontSize:13, fontWeight:500 }}>Download CSV Report</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {results.map((r: any, i: number) => (
                <div key={i} style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", gap:"1.5rem", backdropFilter:"blur(10px)" }}>
                  <div style={{ width:56, height:56, borderRadius:12, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"monospace", fontSize:"1.4rem", fontWeight:700, color:r.result?.overall_score>70?"#22C55E":r.result?.overall_score>40?"#F59E0B":"#EF4444" }}>{r.result?.overall_score ?? "!"}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{r.name}</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {r.status === "error" ? (
                        <span style={{ fontSize:12, color:"#EF4444" }}>Error: {r.error}</span>
                      ) : (
                        <>
                          <span className={r.result?.overall_status==="Compliant"?"badge-compliant":r.result?.overall_status==="Non-Compliant"?"badge-non":"badge-partial"}>{r.result?.overall_status}</span>
                          <span style={{ fontSize:12, color:"#64748B" }}>Risk: {r.result?.overall_risk}</span>
                          <span style={{ fontSize:12, color:"#64748B" }}>{r.industry}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", marginTop:"1.5rem", opacity:visible?1:0, transition:"all 0.5s ease 0.3s" }}>
          <h3 style={{ fontSize:"1rem", fontWeight:600, marginBottom:"1rem", color:"#4F8EF7" }}>Sample CSV — Download & Fill</h3>
          <button onClick={() => {
            const csv = "name,description,industry,data_types\nHireAI,AI hiring and recruitment tool using facial recognition,HR and Recruitment,Biometric Data;Personal Data\nMedBot,Medical diagnosis AI analyzing patient records,Healthcare,Health Records;Personal Data\nCreditAI,Credit scoring system for loan applications,Finance and Banking,Financial Data;Personal Data"
            const blob = new Blob([csv], { type: "text/csv" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a"); a.href = url; a.download = "sample_bulk_check.csv"; a.click()
            toast.success("Sample CSV downloaded!")
          }} style={{ padding:"10px 20px", borderRadius:10, border:"1px solid rgba(79,142,247,0.3)", background:"rgba(79,142,247,0.1)", color:"#4F8EF7", cursor:"pointer", fontSize:13, fontWeight:500 }}>
            Download Sample CSV
          </button>
        </div>
      </div>
    </div>
  )
}
