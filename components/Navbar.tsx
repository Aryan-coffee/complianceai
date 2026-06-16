
"use client"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const path = usePathname()
  const [toolsOpen, setToolsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const active = (href: string) => path === href ? "#4F8EF7" : "#94A3B8"

  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 2rem", height:64, background:"rgba(10,22,40,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>

      {/* LOGO */}
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, boxShadow:"0 0 15px rgba(79,142,247,0.4)" }}>CA</div>
        <span style={{ fontSize:"1.05rem", fontWeight:700, color:"#fff" }}>ComplianceAI</span>
      </Link>

      {/* CENTER NAV */}
      {user && (
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <Link href="/dashboard" style={{ color:active("/dashboard"), textDecoration:"none", fontSize:13, fontWeight:500, padding:"6px 12px", borderRadius:8, background:path==="/dashboard"?"rgba(79,142,247,0.1)":"transparent", transition:"all 0.2s" }}>Dashboard</Link>
          <Link href="/compliance" style={{ color:active("/compliance"), textDecoration:"none", fontSize:13, fontWeight:500, padding:"6px 12px", borderRadius:8, background:path==="/compliance"?"rgba(79,142,247,0.1)":"transparent", transition:"all 0.2s" }}>Check</Link>
          <Link href="/upload" style={{ color:active("/upload"), textDecoration:"none", fontSize:13, fontWeight:500, padding:"6px 12px", borderRadius:8, background:path==="/upload"?"rgba(79,142,247,0.1)":"transparent", transition:"all 0.2s" }}>Upload Doc</Link>
          <Link href="/bulk" style={{ color:active("/bulk"), textDecoration:"none", fontSize:13, fontWeight:500, padding:"6px 12px", borderRadius:8, background:path==="/bulk"?"rgba(79,142,247,0.1)":"transparent", transition:"all 0.2s" }}>Bulk</Link>
          <Link href="/chat" style={{ color:active("/chat"), textDecoration:"none", fontSize:13, fontWeight:500, padding:"6px 12px", borderRadius:8, background:path==="/chat"?"rgba(79,142,247,0.1)":"transparent", transition:"all 0.2s" }}>AI Chat</Link>

          {/* TOOLS DROPDOWN */}
          <div style={{ position:"relative" }} onMouseEnter={()=>setToolsOpen(true)} onMouseLeave={()=>setToolsOpen(false)}>
            <button style={{ color:"#94A3B8", background:"transparent", border:"none", fontSize:13, fontWeight:500, padding:"6px 12px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              Tools <span style={{ fontSize:10 }}>▼</span>
            </button>
            {toolsOpen && (
              <div style={{ position:"absolute", top:"100%", left:0, background:"#112240", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"8px", minWidth:180, boxShadow:"0 20px 40px rgba(0,0,0,0.4)", zIndex:200 }}>
                {[
                  { href:"/analytics", icon:"📊", label:"Analytics" },
                  { href:"/history", icon:"📋", label:"History" },
                  { href:"/compare", icon:"⚖️", label:"Compare" },
                  { href:"/ai-audit", icon:"🏛️", label:"AI Audit" },
                  { href:"/ai-fixes", icon:"🔧", label:"AI Fix Suggestions" },
                  { href:"/audit", icon:"🔍", label:"Audit Trail" },
                  { href:"/calendar", icon:"📅", label:"Calendar" },
                  { href:"/alerts", icon:"🔔", label:"Alerts" },
                ].map((item: any) => (
                  <Link key={item.href} href={item.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, textDecoration:"none", color:path===item.href?"#4F8EF7":"#94A3B8", background:path===item.href?"rgba(79,142,247,0.1)":"transparent", fontSize:13, transition:"all 0.15s" }}
                    onMouseEnter={(e: any) => { if(path!==item.href) e.currentTarget.style.background="rgba(255,255,255,0.05)" }}
                    onMouseLeave={(e: any) => { if(path!==item.href) e.currentTarget.style.background="transparent" }}>
                    <span>{item.icon}</span>{item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* MORE DROPDOWN */}
          <div style={{ position:"relative" }} onMouseEnter={()=>setMoreOpen(true)} onMouseLeave={()=>setMoreOpen(false)}>
            <button style={{ color:"#94A3B8", background:"transparent", border:"none", fontSize:13, fontWeight:500, padding:"6px 12px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              More <span style={{ fontSize:10 }}>▼</span>
            </button>
            {moreOpen && (
              <div style={{ position:"absolute", top:"100%", left:0, background:"#112240", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"8px", minWidth:200, boxShadow:"0 20px 40px rgba(0,0,0,0.4)", zIndex:200 }}>
                {[
                  { href:"/regulations", icon:"📖", label:"Regulations Guide" },
                  { href:"/custom-regulations", icon:"🛡️", label:"Custom Policies" },
                  { href:"/api-docs", icon:"🔌", label:"API Docs" },
                  { href:"/pricing", icon:"💳", label:"Pricing" },
                  { href:"/about", icon:"ℹ️", label:"About" },
                  { href:"/profile", icon:"👤", label:"My Profile" },
                  { href:"/settings", icon:"⚙️", label:"Settings" },
                  { href:"/team", icon:"👥", label:"Team" },
                  { href:"/client-portal", icon:"🏢", label:"Client Portal" },
                ].map((item: any) => (
                  <Link key={item.href} href={item.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, textDecoration:"none", color:path===item.href?"#4F8EF7":"#94A3B8", background:path===item.href?"rgba(79,142,247,0.1)":"transparent", fontSize:13, transition:"all 0.15s" }}
                    onMouseEnter={(e: any) => { if(path!==item.href) e.currentTarget.style.background="rgba(255,255,255,0.05)" }}
                    onMouseLeave={(e: any) => { if(path!==item.href) e.currentTarget.style.background="transparent" }}>
                    <span>{item.icon}</span>{item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT SIDE */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        {user ? (
          <>
            <span style={{ fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, background:"rgba(79,142,247,0.15)", color:"#4F8EF7", textTransform:"uppercase", border:"1px solid rgba(79,142,247,0.3)" }}>{user.plan}</span>
            <a href="/profile" style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, textDecoration:"none", cursor:"pointer", boxShadow:"0 0 10px rgba(79,142,247,0.4)" }}>
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </a>
            <button onClick={logout} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 14px", color:"#94A3B8", cursor:"pointer", fontSize:13, transition:"all 0.2s" }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/regulations" style={{ color:"#94A3B8", textDecoration:"none", fontSize:13, padding:"6px 12px" }}>Regulations</Link>
            <Link href="/pricing" style={{ color:"#94A3B8", textDecoration:"none", fontSize:13, padding:"6px 12px" }}>Pricing</Link>
            <Link href="/about" style={{ color:"#94A3B8", textDecoration:"none", fontSize:13, padding:"6px 12px" }}>About</Link>
            <Link href="/auth/login" style={{ color:"#94A3B8", textDecoration:"none", fontSize:13, padding:"6px 12px" }}>Sign in</Link>
            <Link href="/auth/register" style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"8px 18px", borderRadius:9, fontSize:13, fontWeight:600, boxShadow:"0 0 15px rgba(79,142,247,0.3)" }}>Get started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
