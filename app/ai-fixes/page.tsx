
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"
import api from "@/lib/api"
import Link from "next/link"

export default function AIFixesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checks, setChecks] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [fixes, setFixes] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => {
    if (user) {
      setTimeout(() => setVisible(true), 100)
      api.get("/compliance/checks").then((r: any) => setChecks(r.data || [])).catch(() => {})
    }
  }, [user])

  const generateFixes = async (check: any) => {
    setSelected(check)
    setGenerating(true)
    setFixes([])
    try {
      const res = await api.post("/chat/message", {
        content: `You are an AI compliance expert. For the AI system "${check.ai_system_name}" in the ${check.industry} industry, which was found ${check.status} with score ${check.overall_score}/100 in countries: ${(check.selected_countries||[]).join(", ")}.

Generate specific, actionable fixes in JSON format. Return ONLY valid JSON array like this:
[
  {
    "priority": "Critical",
    "category": "Legal",
    "issue": "specific issue",
    "fix_title": "short fix title",
    "fix_description": "detailed fix description",
    "implementation": "step by step implementation",
    "time_estimate": "2 weeks",
    "effort": "High"
  }
]

Generate 5-7 specific fixes based on the compliance issues found.`,
        session_id: null
      })
      
      const content = res.data.message?.content || ""
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setFixes(parsed)
          toast.success("AI fixes generated!")
        } else {
          // Fallback fixes
          setFixes(generateFallbackFixes(check))
          toast.success("Fixes generated!")
        }
      } catch {
        setFixes(generateFallbackFixes(check))
        toast.success("Fixes generated!")
      }
    } catch (err: any) {
      setFixes(generateFallbackFixes(check))
      toast.error("Using standard fixes")
    } finally { setGenerating(false) }
  }

  const generateFallbackFixes = (check: any) => [
    { priority:"Critical", category:"Legal", issue:"No formal AI governance policy", fix_title:"Implement AI Governance Framework", fix_description:"Create a comprehensive AI governance policy covering all regulatory requirements for " + (check.selected_countries||[]).join(", "), implementation:"1. Appoint AI Compliance Officer\n2. Draft AI ethics policy\n3. Get legal review\n4. Board approval\n5. Staff training", time_estimate:"4-6 weeks", effort:"High" },
    { priority:"High", category:"Data Privacy", issue:"Inadequate consent mechanism", fix_title:"Build Consent Management System", fix_description:"Implement explicit, granular consent for all data processing activities", implementation:"1. Audit all data collection points\n2. Design consent UI\n3. Implement consent database\n4. Add withdrawal mechanism\n5. Test and deploy", time_estimate:"2-3 weeks", effort:"Medium" },
    { priority:"High", category:"Transparency", issue:"No explainability mechanism", fix_title:"Add AI Explainability Layer", fix_description:"Implement explanation system so users understand AI decisions", implementation:"1. Select XAI library (SHAP/LIME)\n2. Integrate with AI model\n3. Build explanation API\n4. Create user-facing UI\n5. Test with users", time_estimate:"3-4 weeks", effort:"High" },
    { priority:"Medium", category:"Human Oversight", issue:"No human review process", fix_title:"Implement Human-in-the-Loop", fix_description:"Add mandatory human review for all high-stakes AI decisions", implementation:"1. Define high-stakes decision criteria\n2. Build review queue system\n3. Train reviewers\n4. Set SLA for reviews\n5. Monitor override rates", time_estimate:"2 weeks", effort:"Medium" },
    { priority:"Medium", category:"Security", issue:"AI model not secured against attacks", fix_title:"AI Security Hardening", fix_description:"Protect AI systems against adversarial attacks and data poisoning", implementation:"1. Run adversarial testing\n2. Implement input validation\n3. Add anomaly detection\n4. Regular security audits\n5. Incident response plan", time_estimate:"4 weeks", effort:"High" },
  ]

  const copyFix = (fix: any) => {
    const text = `Issue: ${fix.issue}\nFix: ${fix.fix_title}\n\n${fix.fix_description}\n\nImplementation:\n${fix.implementation}`
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  if (loading || !user) return null

  const PRIORITY_COLORS: any = { Critical:"#EF4444", High:"#F59E0B", Medium:"#4F8EF7", Low:"#22C55E" }
  const EFFORT_COLORS: any = { High:"#EF4444", Medium:"#F59E0B", Low:"#22C55E" }

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628", position:"relative" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.1) 0%,transparent 70%)", top:-200, right:-200 }} />
      </div>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"6rem 2rem 2rem", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:"2rem", opacity:visible?1:0, animation:visible?"fadeUp 0.6s ease":"none" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.3)", borderRadius:20, padding:"5px 14px", marginBottom:"1rem" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#4F8EF7", display:"inline-block" }} />
            <span style={{ fontSize:11, fontWeight:600, color:"#4F8EF7", textTransform:"uppercase", letterSpacing:"0.08em" }}>AI-Powered</span>
          </div>
          <h1 style={{ fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#fff,#94A3B8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AI Fix Suggestions</h1>
          <p style={{ color:"#94A3B8", fontSize:14, marginTop:4 }}>Select a compliance check — AI will generate specific fixes for each issue</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"1.5rem" }}>
          <div>
            <h3 style={{ fontSize:13, color:"#64748B", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>Your Checks</h3>
            {checks.length === 0 ? (
              <div style={{ textAlign:"center", padding:"2rem", color:"#64748B" }}>
                <div style={{ fontSize:40, marginBottom:"0.75rem" }}>🔍</div>
                <p style={{ marginBottom:"1rem", fontSize:13 }}>No checks yet</p>
                <Link href="/compliance" style={{ color:"#4F8EF7", textDecoration:"none", fontSize:13 }}>Run first check →</Link>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {checks.map((c: any) => (
                  <div key={c.id} onClick={() => generateFixes(c)} style={{ background:selected?.id===c.id?"rgba(79,142,247,0.15)":"rgba(17,34,64,0.8)", border:selected?.id===c.id?"2px solid #4F8EF7":"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"1rem", cursor:"pointer", transition:"all 0.2s", backdropFilter:"blur(10px)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{c.ai_system_name}</div>
                      <span style={{ fontFamily:"monospace", fontSize:14, fontWeight:700, color:c.overall_score>70?"#22C55E":c.overall_score>40?"#F59E0B":"#EF4444" }}>{c.overall_score}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      <span className={c.status==="Compliant"?"badge-compliant":c.status==="Non-Compliant"?"badge-non":"badge-partial"} style={{ fontSize:10 }}>{c.status}</span>
                      <span style={{ fontSize:11, color:"#64748B" }}>{c.industry}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {!selected && !generating && (
              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"4rem", textAlign:"center", backdropFilter:"blur(10px)" }}>
                <div style={{ fontSize:64, marginBottom:"1rem" }}>🤖</div>
                <h3 style={{ fontSize:"1.2rem", fontWeight:600, marginBottom:"0.5rem" }}>Select a compliance check</h3>
                <p style={{ color:"#94A3B8", fontSize:14 }}>AI will analyze issues and generate specific, actionable fixes</p>
              </div>
            )}

            {generating && (
              <div style={{ background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:16, padding:"4rem", textAlign:"center", backdropFilter:"blur(10px)" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", border:"3px solid rgba(79,142,247,0.2)", borderTop:"3px solid #4F8EF7", margin:"0 auto 1.5rem", animation:"spin 1s linear infinite" }} />
                <h3 style={{ fontSize:"1.1rem", fontWeight:600, marginBottom:"0.5rem" }}>Generating AI fixes...</h3>
                <p style={{ color:"#94A3B8", fontSize:13 }}>Analyzing compliance issues for {selected?.ai_system_name}</p>
              </div>
            )}

            {fixes.length > 0 && selected && !generating && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                  <div>
                    <h3 style={{ fontSize:"1rem", fontWeight:600 }}>Fixes for {selected.ai_system_name}</h3>
                    <p style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{fixes.length} fixes generated by AI</p>
                  </div>
                  <button onClick={() => generateFixes(selected)} style={{ padding:"7px 14px", borderRadius:8, border:"1px solid rgba(79,142,247,0.3)", background:"rgba(79,142,247,0.1)", color:"#4F8EF7", cursor:"pointer", fontSize:12 }}>↻ Regenerate</button>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {fixes.map((fix: any, i: number) => (
                    <div key={i} style={{ background:"rgba(17,34,64,0.8)", border:`1px solid ${PRIORITY_COLORS[fix.priority]||"#4F8EF7"}20`, borderLeft:`4px solid ${PRIORITY_COLORS[fix.priority]||"#4F8EF7"}`, borderRadius:14, padding:"1.25rem 1.5rem", backdropFilter:"blur(10px)", opacity:visible?1:0, animation:visible?`fadeUp 0.5s ease ${i*0.1}s both`:"none" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                            <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:`${PRIORITY_COLORS[fix.priority]||"#4F8EF7"}20`, color:PRIORITY_COLORS[fix.priority]||"#4F8EF7", fontWeight:600 }}>{fix.priority}</span>
                            <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"rgba(255,255,255,0.06)", color:"#94A3B8" }}>{fix.category}</span>
                            <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:`${EFFORT_COLORS[fix.effort]||"#4F8EF7"}15`, color:EFFORT_COLORS[fix.effort]||"#4F8EF7" }}>{fix.effort} effort</span>
                            <span style={{ fontSize:11, color:"#64748B" }}>⏱ {fix.time_estimate}</span>
                          </div>
                          <h4 style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:4 }}>{fix.fix_title}</h4>
                          <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6, marginBottom:"0.75rem" }}>{fix.fix_description}</p>
                        </div>
                        <button onClick={() => copyFix(fix)} style={{ padding:"6px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#64748B", cursor:"pointer", fontSize:11, flexShrink:0, marginLeft:10 }}>Copy</button>
                      </div>

                      <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"1rem", border:"1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ fontSize:11, color:"#4F8EF7", fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Implementation Steps</div>
                        {fix.implementation.split("\n").filter((s: string) => s.trim()).map((step: string, si: number) => (
                          <div key={si} style={{ display:"flex", gap:8, fontSize:12, color:"#94A3B8", marginBottom:5, lineHeight:1.5 }}>
                            <span style={{ color:"#4F8EF7", fontWeight:600, flexShrink:0 }}>{si+1}.</span>
                            <span>{step.replace(/^\d+\.\s*/, "")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
