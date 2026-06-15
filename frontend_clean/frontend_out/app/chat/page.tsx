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
  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading])
  useEffect(() => {
    if (user) {
      chatAPI.sessions().then(r => setSessions(r.data))
      chatAPI.quickQuestions().then(r => setQuickQs(r.data.questions))
    }
  }, [user])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }) }, [messages])
  const loadSession = async (id: string) => { setActiveSession(id); const res = await chatAPI.session(id); setMessages(res.data.messages) }
  const sendMessage = async (text?: string) => {
    const content = text || input.trim()
    if (!content) return
    setInput(""); setSending(true)
    setMessages(prev => [...prev, { id: Date.now(), role:"user", content, created_at: new Date() }])
    try {
      const res = await chatAPI.send({ content, session_id: activeSession, check_id: checkId })
      setActiveSession(res.data.session_id)
      setMessages(prev => [...prev, res.data.message])
      chatAPI.sessions().then(r => setSessions(r.data))
    } catch { toast.error("Failed to send") } finally { setSending(false) }
  }
  const deleteSession = async (id: string) => {
    await chatAPI.deleteSession(id)
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSession === id) { setActiveSession(null); setMessages([]) }
  }
  if (loading || !user) return null
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#0A1628" }}>
      <Navbar />
      <div style={{ flex:1, display:"flex", marginTop:64, overflow:"hidden" }}>
        <div style={{ width:260, background:"#112240", borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"1rem" }}>
            <button onClick={() => { setActiveSession(null); setMessages([]) }} style={{ width:"100%", padding:"10px", borderRadius:10, background:"#4F8EF7", border:"none", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer" }}>+ New conversation</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"0 0.75rem" }}>
            {sessions.map(s => (
              <div key={s.id} onClick={() => loadSession(s.id)} style={{ padding:"10px 12px", borderRadius:8, cursor:"pointer", marginBottom:4, background: activeSession === s.id ? "rgba(79,142,247,0.15)" : "transparent", border: activeSession === s.id ? "1px solid rgba(79,142,247,0.3)" : "1px solid transparent", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ overflow:"hidden" }}>
                  <div style={{ fontSize:13, color:"#fff", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</div>
                  <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{s.message_count} messages</div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteSession(s.id) }} style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", padding:4, fontSize:16 }}>x</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
            {messages.length === 0 ? (
              <div style={{ maxWidth:600, margin:"2rem auto", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:"1.5rem" }}>AI</div>
                <h2 style={{ fontSize:"1.3rem", fontWeight:600, marginBottom:"0.5rem" }}>ComplianceAI Assistant</h2>
                <p style={{ color:"#94A3B8", fontSize:14, marginBottom:"2rem" }}>Expert AI governance advisor covering 10 countries.</p>
                {checkId && <p style={{ fontSize:12, color:"#4F8EF7", marginBottom:"1.5rem", background:"rgba(79,142,247,0.1)", padding:"8px 16px", borderRadius:8 }}>Compliance check context loaded</p>}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, textAlign:"left" }}>
                  {quickQs.slice(0,4).map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)} style={{ padding:"12px", borderRadius:10, background:"#112240", border:"1px solid rgba(255,255,255,0.08)", color:"#94A3B8", fontSize:13, cursor:"pointer", textAlign:"left", lineHeight:1.4 }}>{q}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth:720, margin:"0 auto" }}>
                {messages.map((msg: any) => (
                  <div key={msg.id} style={{ marginBottom:"1.5rem", display:"flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap:12 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0, background: msg.role === "user" ? "#4F8EF7" : "#112240", border: msg.role === "assistant" ? "1px solid rgba(79,142,247,0.3)" : "none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600 }}>
                      {msg.role === "user" ? user.full_name[0].toUpperCase() : "AI"}
                    </div>
                    <div style={{ maxWidth:"80%", padding:"12px 16px", borderRadius:12, fontSize:14, lineHeight:1.7, background: msg.role === "user" ? "#4F8EF7" : "#112240", border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none", whiteSpace:"pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
                {sending && (
                  <div style={{ display:"flex", gap:12, marginBottom:"1.5rem" }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"#112240", border:"1px solid rgba(79,142,247,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>AI</div>
                    <div style={{ padding:"12px 16px", borderRadius:12, background:"#112240", border:"1px solid rgba(255,255,255,0.06)", fontSize:14, color:"#64748B" }}>Thinking...</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
          <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid rgba(255,255,255,0.06)", background:"#0A1628" }}>
            <div style={{ maxWidth:720, margin:"0 auto", display:"flex", gap:10 }}>
              <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder="Ask about AI regulations..." style={{ flex:1 }} disabled={sending} />
              <button onClick={() => sendMessage()} disabled={sending || !input.trim()} className="btn-primary" style={{ padding:"12px 18px", whiteSpace:"nowrap" }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function ChatPage() {
  return <Suspense fallback={<div style={{ color:"#fff", padding:"2rem" }}>Loading...</div>}><ChatContent /></Suspense>
}
