
"use client"
import { useState } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"

const REGS = [
  { country:"European Union", flag:"EU", reg:"EU AI Act 2024", risk:"Strictest", color:"#EF4444", desc:"World most comprehensive AI regulation. Classifies AI into risk tiers. High-risk AI requires conformity assessment, human oversight, and CE marking.", points:["Prohibits emotion recognition in workplaces","Biometric surveillance in public spaces banned","High-risk AI must register in EU database","Fines up to 35M euros or 7% global revenue"], sectors:["Healthcare","Employment","Finance","Law Enforcement","Education"] },
  { country:"India", flag:"IN", reg:"DPDP Act 2023", risk:"Emerging", color:"#F59E0B", desc:"Digital Personal Data Protection Act 2023 establishes consent-based data processing. Sector-specific rules for healthcare, finance, and education AI.", points:["Explicit consent required for personal data","Children data requires parental consent","Data breach notification mandatory","Penalties up to Rs 250 crore"], sectors:["Healthcare","EdTech","FinTech","Government"] },
  { country:"United States", flag:"US", reg:"NIST AI RMF + EO 14110", risk:"Sectoral", color:"#4F8EF7", desc:"US takes a sectoral approach with no single AI law. NIST AI RMF provides voluntary guidelines. EO 14110 mandates safety testing for frontier AI models.", points:["AI hiring tools must be audited annually","Watermarking required for AI-generated content","Red-team testing for high-capability models","Federal agencies must inventory AI systems"], sectors:["Healthcare","Finance","Employment","National Security"] },
  { country:"United Kingdom", flag:"GB", reg:"UK AI Framework", risk:"Pro-innovation", color:"#22C55E", desc:"Pro-innovation, sector-based approach. Five principles: safety, transparency, fairness, accountability, and contestability.", points:["No single AI law - sector regulators apply rules","UK GDPR applies to AI processing personal data","FCA Consumer Duty covers financial AI","AI Safety Institute evaluates frontier models"], sectors:["Financial Services","Healthcare","Employment"] },
  { country:"Canada", flag:"CA", reg:"AIDA + PIPEDA", risk:"Moderate", color:"#8B5CF6", desc:"AIDA is Canada proposed AI law. Focus on high-impact AI systems. PIPEDA applies to AI processing personal data.", points:["High-impact AI requires risk assessment","Records must be kept for 10 years","Criminal penalties up to CAD 25 million","Accountable officers must ensure compliance"], sectors:["Banking","Healthcare","Government"] },
  { country:"Singapore", flag:"SG", reg:"Model AI Governance", risk:"Voluntary", color:"#06B6D4", desc:"Voluntary Model AI Governance Framework widely adopted. Based on human-centric values. AI Verify testing framework launched 2023.", points:["Voluntary but widely adopted","Human-in-the-loop for consequential decisions","AI Verify covers 9 governance dimensions","PDPA requires DPO for biometric processing"], sectors:["Finance","Healthcare","Government"] },
  { country:"Australia", flag:"AU", reg:"AI Ethics Framework", risk:"Voluntary", color:"#F97316", desc:"8 voluntary AI ethics principles. Privacy Act Australian Privacy Principles apply to AI. TGA regulates AI medical devices.", points:["8 AI ethics principles - voluntary","Privacy Act APPs apply to AI data","TGA regulates AI medical devices","Fines up to AUD 50M for serious breaches"], sectors:["Healthcare","Financial Services","Government"] },
  { country:"Brazil", flag:"BR", reg:"Lei de IA + LGPD", risk:"Emerging", color:"#10B981", desc:"Brazil AI Bill before Senate. LGPD already fully enforced. High-risk AI requires conformity assessment.", points:["LGPD: explicit consent for sensitive data","AI must respect human dignity","Fines up to 2% of Brazil revenue","Right to explanation for automated decisions"], sectors:["Finance","Healthcare","Government","Employment"] },
  { country:"China", flag:"CN", reg:"Generative AI Regulations", risk:"Strict", color:"#EF4444", desc:"Specific Generative AI Regulations (2023) requiring content labeling and algorithm registration. PIPL is strict data protection law.", points:["AI-generated content must be watermarked","Algorithms must register with CAC","Separate consent for biometric data","No political content generation allowed"], sectors:["All sectors","Generative AI","Social Media","Finance"] },
  { country:"Japan", flag:"JP", reg:"AI Guidelines (METI)", risk:"Soft law", color:"#6366F1", desc:"Soft-law approach with voluntary METI AI Guidelines based on 7 social principles. APPI applies to AI processing personal data.", points:["7 social principles for human-centric AI","APPI: opt-in consent for sensitive data","Breach notification mandatory","Copyright concerns for AI training data"], sectors:["Manufacturing","Healthcare","Finance","Government"] },
]

export default function RegulationsPage() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const filtered = REGS.filter(r => r.country.toLowerCase().includes(search.toLowerCase()) || r.reg.toLowerCase().includes(search.toLowerCase()))
  const sel = REGS.find(r => r.flag === selected)

  return (
    <div style={{ minHeight:"100vh", background:"#0A1628" }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"6rem 2rem 2rem" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{ fontFamily:"monospace", fontSize:11, color:"#4F8EF7", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1rem" }}>Knowledge Base</div>
          <h1 style={{ fontSize:"2.2rem", fontWeight:700, marginBottom:"1rem" }}>Global AI Regulation Guide</h1>
          <p style={{ color:"#94A3B8", maxWidth:600, margin:"0 auto", fontSize:15 }}>Understand AI compliance requirements across 10 countries. Click any country to see detailed regulations and requirements.</p>
        </div>

        <input className="input" placeholder="Search country or regulation..." value={search} onChange={(e: any)=>setSearch(e.target.value)} style={{ maxWidth:500, marginBottom:"2rem" }} />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:"2rem" }}>
          {filtered.map(r => (
            <div key={r.flag} onClick={()=>setSelected(selected===r.flag?null:r.flag)} style={{ background:selected===r.flag?"rgba(79,142,247,0.2)":"#112240", border:selected===r.flag?"2px solid #4F8EF7":"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"1.25rem 1rem", cursor:"pointer", transition:"all 0.2s", textAlign:"center" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:r.color+"20", border:"2px solid "+r.color, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 0.75rem", fontWeight:700, fontSize:11, color:r.color }}>{r.flag}</div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{r.country}</div>
              <div style={{ fontSize:10, color:"#64748B" }}>{r.reg.split(" ")[0]}</div>
              <div style={{ marginTop:6, fontSize:10, padding:"2px 8px", borderRadius:20, background:r.color+"20", color:r.color, display:"inline-block" }}>{r.risk}</div>
            </div>
          ))}
        </div>

        {sel && (
          <div className="card" style={{ marginBottom:"2rem", border:"1px solid rgba(79,142,247,0.3)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:sel.color+"20", border:"2px solid "+sel.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:sel.color }}>{sel.flag}</div>
                <div><h2 style={{ fontSize:"1.3rem", fontWeight:700 }}>{sel.country}</h2><p style={{ fontSize:13, color:"#64748B" }}>{sel.reg}</p></div>
              </div>
              <span style={{ padding:"4px 14px", borderRadius:20, background:sel.color+"20", color:sel.color, fontSize:12, fontWeight:600 }}>{sel.risk}</span>
            </div>
            <p style={{ fontSize:14, color:"#94A3B8", lineHeight:1.7, marginBottom:"1.5rem" }}>{sel.desc}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
              <div>
                <h4 style={{ fontSize:12, color:"#4F8EF7", fontWeight:600, marginBottom:"0.75rem", textTransform:"uppercase" }}>Key Requirements</h4>
                {sel.points.map((p,i) => (<div key={i} style={{ display:"flex", gap:8, marginBottom:8, fontSize:13, color:"#94A3B8" }}><span style={{ color:"#22C55E" }}>✓</span>{p}</div>))}
              </div>
              <div>
                <h4 style={{ fontSize:12, color:"#4F8EF7", fontWeight:600, marginBottom:"0.75rem", textTransform:"uppercase" }}>Affected Sectors</h4>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {sel.sectors.map(s => (<span key={s} style={{ padding:"4px 12px", borderRadius:20, background:"#0A1628", border:"1px solid rgba(255,255,255,0.08)", fontSize:12, color:"#94A3B8" }}>{s}</span>))}
                </div>
              </div>
            </div>
            <div style={{ marginTop:"1.5rem", paddingTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:12 }}>
              <Link href="/compliance" style={{ background:"#4F8EF7", color:"#fff", textDecoration:"none", padding:"10px 20px", borderRadius:8, fontSize:13, fontWeight:500 }}>Check {sel.country} compliance</Link>
              <Link href="/upload" style={{ background:"transparent", color:"#94A3B8", textDecoration:"none", padding:"10px 20px", borderRadius:8, fontSize:13, border:"1px solid rgba(255,255,255,0.1)" }}>Upload document</Link>
            </div>
          </div>
        )}

        <div style={{ background:"#112240", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"2rem", textAlign:"center" }}>
          <h3 style={{ fontSize:"1.2rem", fontWeight:600, marginBottom:"0.75rem" }}>Ready to check your AI compliance?</h3>
          <p style={{ color:"#94A3B8", fontSize:14, marginBottom:"1.5rem" }}>Upload a document or describe your AI system and get instant results</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <Link href="/upload" style={{ background:"#4F8EF7", color:"#fff", textDecoration:"none", padding:"12px 24px", borderRadius:10, fontWeight:500 }}>Upload Document</Link>
            <Link href="/compliance" style={{ background:"transparent", color:"#fff", textDecoration:"none", padding:"12px 24px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)" }}>Manual Check</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
