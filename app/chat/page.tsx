
"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { chatAPI } from "@/lib/api"
import Navbar from "@/components/Navbar"
import toast from "react-hot-toast"

function ChatContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkId = searchParams.get("check_id")
  const [sessions, setSessions] = useState<any[]>([])
  const [activeSession, setActiveSession] = useState<string|null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [quickQs, setQuickQs] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => {
    if (user) {
      chatAPI.sessions().then((r: any) => setSessions(r.data)).catch(()=>{})
      chatAPI.quickQuestions().then((r: any) => setQuickQs(r.data.questions || [])).catch(()=>{})
    }
  }, [user])
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}) }, [messages])

  const loadSession = async (id: string) => {
    setActiveSession(id)
    const res: any = await chatAPI.session(id)
    setMessages(res.data.messages || [])
  }

  const sendMessage = async (text?: string) => {
    const content = text || input.trim()
    if (!content) return
    setInput(""); setSending(true)
    setMessages((prev: any[]) => [...prev, {id:Date.now(), role:"user", content, created_at:new Date()}])
    try {
      const res: any = await chatAPI.send({content, session_id:activeSession, check_id:checkId})
      setActiveSession(res.data.session_id)
      setMessages((prev: any[]) => [...prev, res.data.message])
      chatAPI.sessions().then((r: any) => setSessions(r.data)).catch(()=>{})
    } catch { toast.error("Failed to send") } finally { setSending(false) }
  }

  const deleteSession = async (id: string) => {
    await chatAPI.deleteSession(id)
    setSessions((prev: any[]) => prev.filter((s: any) => s.id !== id))
    if (activeSession === id) { setActiveSession(null); setMessages([]) }
  }

  if (loading || !user) return null

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#0A1628" }}>
      <style>{`@keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}} @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(79,142,247,0.08) 0%,transparent 70%)", top:0, right:0 }} />
      </div>
      <Navbar />
      <div style={{ flex:1, display:"flex", marginTop:64, overflow:"hidden", position:"relative", zIndex:1 }}>
        <div style={{ width:260, background:"rgba(17,34,64,0.9)", borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", overflow:"hidden", backdropFilter:"blur(10px)" }}>
          <div style={{ padding:"1rem" }}>
            <button onClick={()=>{setActiveSession(null);setMessages([])}} style={{ width:"100%", padding:"11px", borderRadius:10, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>+ New conversation</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"0 0.75rem" }}>
            {sessions.map((s: any) => (
              <div key={s.id} onClick={()=>loadSession(s.id)} style={{ padding:"10px 12px", borderRadius:8, cursor:"pointer", marginBottom:4, background:activeSession===s.id?"rgba(79,142,247,0.15)":"transparent", border:activeSession===s.id?"1px solid rgba(79,142,247,0.3)":"1px solid transparent", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all 0.15s" }}>
                <div style={{ overflow:"hidden" }}>
                  <div style={{ fontSize:13, color:"#fff", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</div>
                  <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{s.message_count} messages</div>
                </div>
                <button onClick={(e: any)=>{e.stopPropagation();deleteSession(s.id)}} style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", padding:4, fontSize:16 }}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
            {messages.length === 0 ? (
              <div style={{ maxWidth:620, margin:"2rem auto", textAlign:"center" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,rgba(79,142,247,0.2),rgba(124,58,237,0.2))", border:"1px solid rgba(79,142,247,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", fontSize:28 }}>🤖</div>
                <h2 style={{ fontSize:"1.4rem", fontWeight:700, marginBottom:"0.5rem" }}>ComplianceAI Assistant</h2>
                <p style={{ color:"#94A3B8", fontSize:14, marginBottom:"2rem", lineHeight:1.6 }}>Expert AI governance advisor. Ask anything about AI regulations across 10 countries.</p>
                {checkId && <div style={{ fontSize:12, color:"#4F8EF7", marginBottom:"1.5rem", background:"rgba(79,142,247,0.1)", padding:"10px 16px", borderRadius:10, border:"1px solid rgba(79,142,247,0.2)" }}>Compliance check context loaded</div>}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, textAlign:"left" }}>
                  {quickQs.slice(0,4).map((q: string, i: number) => (
                    <button key={i} onClick={()=>sendMessage(q)} style={{ padding:"14px", borderRadius:12, background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", color:"#94A3B8", fontSize:13, cursor:"pointer", textAlign:"left", lineHeight:1.4, transition:"all 0.2s" }}>{q}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth:740, margin:"0 auto" }}>
                {messages.map((msg: any) => (
                  <div key={msg.id} style={{ marginBottom:"1.5rem", display:"flex", flexDirection:msg.role==="user"?"row-reverse":"row", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, background:msg.role==="user"?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"rgba(17,34,64,0.8)", border:msg.role==="assistant"?"1px solid rgba(79,142,247,0.3)":"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:600 }}>
                      {msg.role==="user" ? (user.full_name?.[0]?.toUpperCase() || "U") : "🤖"}
                    </div>
                    <div style={{ maxWidth:"80%", padding:"14px 18px", borderRadius:14, fontSize:14, lineHeight:1.7, background:msg.role==="user"?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"rgba(17,34,64,0.8)", border:msg.role==="assistant"?"1px solid rgba(255,255,255,0.06)":"none", whiteSpace:"pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
                {sending && (
                  <div style={{ display:"flex", gap:12, marginBottom:"1.5rem", alignItems:"flex-start" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>🤖</div>
                    <div style={{ padding:"14px 18px", borderRadius:14, background:"rgba(17,34,64,0.8)", border:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:4, alignItems:"center" }}>
                      {[0,1,2].map((i: number) => <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#4F8EF7", display:"inline-block", animation:`bounce 1.2s ${i*0.2}s infinite` }} />)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
          <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(10,22,40,0.9)", backdropFilter:"blur(10px)" }}>
            <div style={{ maxWidth:740, margin:"0 auto", display:"flex", gap:10 }}>
              <input className="input" value={input} onChange={(e: any)=>setInput(e.target.value)} onKeyDown={(e: any)=>e.key==="Enter"&&!e.shiftKey&&sendMessage()} placeholder="Ask about AI regulations..." style={{ flex:1, background:"rgba(17,34,64,0.8)" }} disabled={sending} />
              <button onClick={()=>sendMessage()} disabled={sending||!input.trim()} style={{ padding:"12px 20px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", color:"#fff", fontWeight:600, fontSize:14, opacity:(!input.trim()||sending)?0.5:1 }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{color:"#fff",padding:"2rem",background:"#0A1628",minHeight:"100vh"}}>Loading...</div>}>
      <ChatContent />
    </Suspense>
  )
}
