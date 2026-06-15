"use client"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 2rem",height:64,background:"rgba(10,22,40,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
      <Link href="/" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
        <div style={{ width:32,height:32,borderRadius:8,background:"#4F8EF7",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13 }}>CA</div>
        <span style={{ fontSize:"1.1rem",fontWeight:600,color:"#fff" }}>ComplianceAI</span>
      </Link>
      <div style={{ display:"flex",alignItems:"center",gap:"1.5rem" }}>
        {user ? (
          <>
            <Link href="/dashboard" style={{ color:"#94A3B8",textDecoration:"none",fontSize:14 }}>Dashboard</Link>
            <Link href="/compliance" style={{ color:"#94A3B8",textDecoration:"none",fontSize:14 }}>Check</Link>
            <Link href="/chat" style={{ color:"#94A3B8",textDecoration:"none",fontSize:14 }}>Chat</Link>
            <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"rgba(79,142,247,0.15)",color:"#4F8EF7",textTransform:"uppercase" }}>{user.plan}</span>
            <button onClick={logout} style={{ background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 14px",color:"#94A3B8",cursor:"pointer",fontSize:13 }}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/pricing" style={{ color:"#94A3B8",textDecoration:"none",fontSize:14 }}>Pricing</Link>
            <Link href="/auth/login" style={{ color:"#94A3B8",textDecoration:"none",fontSize:14 }}>Sign in</Link>
            <Link href="/auth/register" style={{ background:"#4F8EF7",color:"#fff",textDecoration:"none",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:500 }}>Get started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
