
"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import api from "@/lib/api"
import toast from "react-hot-toast"
import Link from "next/link"

const QUICK_QUESTIONS = [
  "What is the EU AI Act and who does it apply to?",
  "How do I make my AI system GDPR compliant?",
  "What are India DPDP Act requirements for AI?",
  "What is a high-risk AI system under EU AI Act?",
  "How do I conduct an AI conformity assessment?",
  "What are the penalties for EU AI Act violations?",
  "What is NIST AI RMF framework?",
  "How to implement human oversight in AI systems?",
]

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<any[]>([])
  const [activeSession, setActiveSession] = useState<string|null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (!loading && !user) router.push("/auth/login") }, [user, loading, router])
  useEffect(() => { if (user) loadSessions() }, [user])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }) }, [messages])

  const loadSessions = async () => {
    try {
      const res = await api.get("/chat/sessions")
      setSessions(res.data || [])
    } catch {}
  }

  const loadSession = async (sessionId: string) => {
    setActiveSession(sessionId)
    setSidebarOpen(false)
    try {
      const res = await api.get("/chat/sessions/" + sessionId)
      setMessages(res.data.messages || [])
    } catch { toast.error("Failed to load") }
  }

  const newChat = () => {
    setActiveSession(null)
    setMessages([])
    setSidebarOpen(false)
  }

  const deleteSession = async (e: any, id: string) => {
    e.stopPropagation()
    try {
      await api.delete("/chat/sessions/" + id)
      setSessions(prev => prev.filter((s: any) => s.id !== id))
      if (activeSession === id) newChat()
      toast.success("Deleted!")
    } catch {}
  }

  const sendMessage = async (content?: string) => {
    const msg = content || input.trim()
    if (!msg || sending) return
    setInput("")
    setSending(true)
    setMessages(prev => [...prev, { role:"user", content:msg, created_at:new Date().toISOString() }])
    try {
      const res = await api.post("/chat/message", { content:msg, session_id:activeSession })
      if (!activeSession) { setActiveSession(res.data.session_id); loadSessions() }
      setMessages(prev => [...prev, res.data.message])
    } catch {
      toast.error("Failed to send")
      setMessages(prev => prev.slice(0,-1))
    } finally { setSending(false) }
  }

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (loading || !user) return null

  return (
    <div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:"#0A1628", overflow:"hidden" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        * { box-sizing: border-box; }
        
        .chat-layout { display: flex; flex: 1; overflow: hidden; }
        
        /* SIDEBAR */
        .chat-sidebar {
          width: 260px;
          background: #070F1E;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        
        /* MOBILE */
        @media(max-width: 768px) {
          .chat-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            width: 280px;
          }
          .chat-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 199;
          }
          .sidebar-overlay.open {
            display: block;
          }
          .quick-grid {
            grid-template-columns: 1fr !important;
          }
          .msg-bubble {
            max-width: 90% !important;
          }
        }
        
        .sessions-list::-webkit-scrollbar { width: 3px; }
        .sessions-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .chat-msgs::-webkit-scrollbar { width: 4px; }
        .chat-msgs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .session-row:hover { background: rgba(79,142,247,0.08) !important; }
        .session-row:hover .del-btn { opacity: 1 !important; }
        .quick-btn:hover { background: rgba(79,142,247,0.12) !important; border-color: rgba(79,142,247,0.3) !important; }
        textarea { resize: none; }
        textarea::-webkit-scrollbar { display: none; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ height:56, background:"rgba(7,15,30,0.95)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", padding:"0 1rem", gap:10, flexShrink:0, zIndex:10 }}>
        <Link href="/dashboard" style={{ display:"flex", alignItems:"center", gap:6, textDecoration:"none", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 12px", color:"#94A3B8", fontSize:13, flexShrink:0 }}>
          ← Back
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 10px", color:"#94A3B8", cursor:"pointer", fontSize:15, flexShrink:0 }}>
          ☰
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>AI Compliance Assistant</div>
          <div style={{ fontSize:11, color:"#22C55E", display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"#22C55E", display:"inline-block", animation:"pulse 2s infinite" }} />
            Online · EU AI Act · GDPR · DPDP
          </div>
        </div>
        <button onClick={newChat} style={{ background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", border:"none", borderRadius:8, padding:"7px 12px", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:600, flexShrink:0 }}>+ New</button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="chat-layout">

        {/* SIDEBAR OVERLAY */}
        <div className={`sidebar-overlay ${sidebarOpen?"open":""}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <div className={`chat-sidebar ${sidebarOpen?"open":""}`}>
          <div style={{ padding:"1rem", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"0.75rem" }}>
              <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12 }}>CA</div>
              <span style={{ fontSize:14, fontWeight:600 }}>ComplianceAI</span>
            </div>
            <button onClick={newChat} style={{ width:"100%", padding:"9px", borderRadius:9, border:"1px solid rgba(79,142,247,0.3)", background:"rgba(79,142,247,0.08)", color:"#4F8EF7", cursor:"pointer", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              + New conversation
            </button>
          </div>

          <div className="sessions-list" style={{ flex:1, overflowY:"auto", padding:"0.5rem" }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign:"center", padding:"2rem 1rem", color:"#475569", fontSize:13 }}>No conversations yet</div>
            ) : (
              <>
                <div style={{ fontSize:10, color:"#475569", padding:"6px 8px 4px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Recent</div>
                {sessions.map((s: any) => (
                  <div key={s.id} className="session-row" onClick={() => loadSession(s.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 8px", borderRadius:8, cursor:"pointer", background:activeSession===s.id?"rgba(79,142,247,0.12)":"transparent", border:activeSession===s.id?"1px solid rgba(79,142,247,0.2)":"1px solid transparent", marginBottom:2, transition:"all 0.15s" }}>
                    <span style={{ fontSize:14, flexShrink:0 }}>💬</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, color:activeSession===s.id?"#4F8EF7":"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:activeSession===s.id?500:400 }}>{s.title||"Compliance Chat"}</div>
                      <div style={{ fontSize:10, color:"#475569" }}>{s.message_count} msgs</div>
                    </div>
                    <button className="del-btn" onClick={(e: any) => deleteSession(e,s.id)} style={{ opacity:0, width:20, height:20, borderRadius:4, border:"none", background:"rgba(239,68,68,0.15)", color:"#EF4444", cursor:"pointer", fontSize:11, flexShrink:0, transition:"opacity 0.15s", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                  </div>
                ))}
              </>
            )}
          </div>

          <div style={{ padding:"0.875rem 1rem", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12, flexShrink:0 }}>{user.full_name?.[0]?.toUpperCase()||"U"}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.full_name}</div>
                <div style={{ fontSize:10, color:"#475569", textTransform:"capitalize" }}>{user.plan} plan</div>
              </div>
            </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

          {/* MESSAGES */}
          <div className="chat-msgs" style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
            {messages.length === 0 ? (
              <div style={{ maxWidth:600, margin:"0 auto", paddingTop:"1rem" }}>
                <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#4F8EF7,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 0.875rem", fontSize:24, boxShadow:"0 0 24px rgba(79,142,247,0.3)" }}>⚖️</div>
                  <h2 style={{ fontSize:"1.2rem", fontWeight:700, marginBottom:"0.5rem" }}>AI Compliance Assistant</h2>
                  <p style={{ color:"#64748B", fontSize:13, lineHeight:1.6 }}>Ask me anything about AI compliance, regulations, and governance. I specialize in EU AI Act, GDPR, India DPDP, NIST AI RMF, and more.</p>
                </div>
                <div className="quick-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {QUICK_QUESTIONS.map((q: string, i: number) => (
                    <button key={i} className="quick-btn" onClick={() => sendMessage(q)} style={{ padding:"11px 13px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(17,34,64,0.6)", color:"#94A3B8", cursor:"pointer", fontSize:12, textAlign:"left", lineHeight:1.4, transition:"all 0.2s" }}>{q}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth:680, margin:"0 auto" }}>
                {messages.map((msg: any, i: number) => (
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:"1rem", flexDirection:msg.role==="user"?"row-reverse":"row", animation:"fadeIn 0.3s ease" }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, background:msg.role==="user"?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"rgba(255,255,255,0.06)", border:msg.role==="user"?"none":"1px solid rgba(255,255,255,0.1)", marginTop:2 }}>
                      {msg.role==="user"?(user.full_name?.[0]?.toUpperCase()||"U"):"⚖️"}
                    </div>
                    <div className="msg-bubble" style={{ maxWidth:"80%", display:"flex", flexDirection:"column", alignItems:msg.role==="user"?"flex-end":"flex-start" }}>
                      <div style={{ padding:"10px 14px", borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", background:msg.role==="user"?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"rgba(17,34,64,0.9)", border:msg.role==="user"?"none":"1px solid rgba(255,255,255,0.08)", fontSize:14, lineHeight:1.7, color:"#fff", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize:10, color:"#475569", marginTop:3, padding:"0 4px" }}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : ""}
                      </div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>⚖️</div>
                    <div style={{ padding:"12px 16px", borderRadius:"16px 16px 16px 4px", background:"rgba(17,34,64,0.9)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", gap:5, alignItems:"center" }}>
                      {[0,1,2].map((i: number) => (
                        <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#4F8EF7", animation:`pulse 1.2s ease ${i*0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* INPUT */}
          <div style={{ padding:"0.75rem 1rem", borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(7,15,30,0.8)", flexShrink:0 }}>
            <div style={{ maxWidth:680, margin:"0 auto", display:"flex", gap:8, alignItems:"flex-end", background:"rgba(17,34,64,0.8)", border:"1px solid rgba(79,142,247,0.2)", borderRadius:12, padding:"8px 10px" }}>
              <textarea ref={inputRef} value={input} onChange={(e: any) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about EU AI Act, GDPR, compliance..." rows={1} style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:14, lineHeight:1.6, maxHeight:100, overflowY:"auto", fontFamily:"inherit", padding:0 }}
                onInput={(e: any) => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,100)+"px" }} />
              <button onClick={() => sendMessage()} disabled={!input.trim()||sending} style={{ width:34, height:34, borderRadius:8, border:"none", cursor:"pointer", background:input.trim()&&!sending?"linear-gradient(135deg,#4F8EF7,#7C3AED)":"rgba(255,255,255,0.06)", color:input.trim()&&!sending?"#fff":"#475569", fontSize:15, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                {sending ? <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 1s linear infinite" }} /> : "↑"}
              </button>
            </div>
            <div style={{ textAlign:"center", fontSize:10, color:"#334155", marginTop:6 }}>Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      </div>
    </div>
  )
}
