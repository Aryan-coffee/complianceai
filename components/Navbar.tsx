
"use client"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const path = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const active = (href: string) => path === href ? "#4F8EF7" : "#94A3B8"

  const ALL_LINKS = [
    { href:"/dashboard", icon:"📊", label:"Dashboard" },
    { href:"/compliance", icon:"🔍", label:"Check" },
    { href:"/upload", icon:"📁", label:"Upload Doc" },
    { href:"/bulk", icon:"📋", label:"Bulk Check" },
    { href:"/chat", icon:"💬", label:"AI Chat" },
    { href:"/ai-audit", icon:"🏛️", label:"AI Audit" },
    { href:"/ai-fixes", icon:"🔧", label:"AI Fixes" },
    { href:"/analytics", icon:"📈", label:"Analytics" },
    { href:"/history", icon:"🕒", label:"History" },
    { href:"/compare", icon:"⚖️", label:"Compare" },
    { href:"/audit", icon:"📝", label:"Audit Trail" },
    { href:"/calendar", icon:"📅", label:"Calendar" },
    { href:"/alerts", icon:"🔔", label:"Alerts" },
    { href:"/regulations", icon:"📖", label:"Regulations" },
    { href:"/custom-regulations", icon:"🛡️", label:"Policies" },
    { href:"/api-docs", icon:"🔌", label:"API Docs" },
    { href:"/pricing", icon:"💳", label:"Pricing" },
    { href:"/profile", icon:"👤", label:"Profile" },
    { href:"/settings", icon:"⚙️", label:"Settings" },
    { href:"/team", icon:"👥", label:"Team" },
    { href:"/client-portal", icon:"🏢", label:"Clients" },
    { href:"/about", icon:"ℹ️", label:"About" },
  ]

  return (
    <>
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-hamburger { display: none !important; }
        @media(max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>

      {/* TOP NAVBAR */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(10,22,40,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.08)", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1rem" }}>
        
        {/* LOGO */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13 }}>CA</div>
          <span style={{ fontSize:15, fontWeight:700, color:"#fff" }}>ComplianceAI</span>
        </Link>

        {/* DESKTOP CENTER NAV */}
        <div className="desktop-nav" style={{ alignItems:"center", gap:2 }}>
          {user && (
            <>
              {[
                {href:"/dashboard",label:"Dashboard"},
                {href:"/compliance",label:"Check"},
                {href:"/upload",label:"Upload"},
                {href:"/bulk",label:"Bulk"},
                {href:"/chat",label:"AI Chat"},
              ].map((item: any) => (
                <Link key={item.href} href={item.href} style={{ color:active(item.href), textDecoration:"none", fontSize:13, fontWeight:500, padding:"6px 10px", borderRadius:8, background:path===item.href?"rgba(79,142,247,0.1)":"transparent" }}>{item.label}</Link>
              ))}
              <div style={{ position:"relative", display:"inline-block" }}>
                <button onClick={()=>setMenuOpen(!menuOpen)} style={{ color:"#94A3B8", background:"transparent", border:"none", fontSize:13, fontWeight:500, padding:"6px 10px", borderRadius:8, cursor:"pointer" }}>More ▼</button>
                {menuOpen && (
                  <div style={{ position:"absolute", top:"100%", left:0, background:"#112240", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:8, minWidth:200, zIndex:200, boxShadow:"0 20px 40px rgba(0,0,0,0.4)" }} onMouseLeave={()=>setMenuOpen(false)}>
                    {ALL_LINKS.slice(5).map((item: any) => (
                      <Link key={item.href} href={item.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, textDecoration:"none", color:path===item.href?"#4F8EF7":"#94A3B8", background:path===item.href?"rgba(79,142,247,0.1)":"transparent", fontSize:13 }}>
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {user ? (
            <>
              <span className="desktop-nav" style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"rgba(79,142,247,0.15)", color:"#4F8EF7", textTransform:"uppercase", border:"1px solid rgba(79,142,247,0.3)" }}>{user.plan}</span>
              <Link href="/profile" style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, textDecoration:"none" }}>{user.full_name?.[0]?.toUpperCase()||"U"}</Link>
              <button onClick={logout} className="desktop-nav" style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 12px", color:"#94A3B8", cursor:"pointer", fontSize:13 }}>Logout</button>
              {/* MOBILE HAMBURGER */}
              <button className="mobile-hamburger" onClick={()=>setMenuOpen(!menuOpen)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 10px", color:"#fff", cursor:"pointer", fontSize:18, alignItems:"center", justifyContent:"center" }}>
                {menuOpen ? "✕" : "☰"}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ color:"#94A3B8", textDecoration:"none", fontSize:13, padding:"6px 10px" }}>Sign in</Link>
              <Link href="/auth/register" style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", textDecoration:"none", padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600 }}>Get started</Link>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE FULL MENU */}
      {menuOpen && user && (
        <div style={{ position:"fixed", top:56, left:0, right:0, bottom:0, background:"#070F1E", zIndex:99, overflowY:"auto" }}>
          <div style={{ padding:"1rem" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:"1rem" }}>
              {ALL_LINKS.map((item: any) => (
                <Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"14px 8px", borderRadius:12, textDecoration:"none", background:path===item.href?"rgba(79,142,247,0.15)":"rgba(17,34,64,0.8)", border:path===item.href?"1px solid rgba(79,142,247,0.3)":"1px solid rgba(255,255,255,0.06)", textAlign:"center" }}>
                  <span style={{ fontSize:22 }}>{item.icon}</span>
                  <span style={{ fontSize:11, color:path===item.href?"#4F8EF7":"#94A3B8", fontWeight:path===item.href?600:400, lineHeight:1.2 }}>{item.label}</span>
                </Link>
              ))}
            </div>
            <button onClick={() => { logout(); setMenuOpen(false) }} style={{ width:"100%", padding:"14px", borderRadius:12, border:"1px solid rgba(239,68,68,0.3)", background:"transparent", color:"#EF4444", cursor:"pointer", fontSize:14, fontWeight:500 }}>Logout</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV - MOBILE ONLY */}
      {user && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, background:"rgba(7,15,30,0.97)", backdropFilter:"blur(12px)", borderTop:"1px solid rgba(255,255,255,0.08)", display:"none" }} className="mobile-bottom-nav">
          <style>{`.mobile-bottom-nav { display: none !important; } @media(max-width:768px){ .mobile-bottom-nav { display: flex !important; } }`}</style>
          <div style={{ display:"flex", width:"100%" }}>
            {[
              {href:"/dashboard",icon:"📊",label:"Home"},
              {href:"/compliance",icon:"🔍",label:"Check"},
              {href:"/chat",icon:"💬",label:"Chat"},
              {href:"/history",icon:"🕒",label:"History"},
              {href:"/profile",icon:"👤",label:"Profile"},
            ].map((item: any) => (
              <Link key={item.href} href={item.href} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"8px 4px 12px", textDecoration:"none", gap:3, borderTop:path===item.href?"2px solid #4F8EF7":"2px solid transparent" }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ fontSize:10, color:path===item.href?"#4F8EF7":"#64748B", fontWeight:path===item.href?600:400 }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
