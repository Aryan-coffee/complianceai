"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "./api"
const AuthContext = createContext({} as any)
export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  useEffect(() => { const t = localStorage.getItem("token"); const u = localStorage.getItem("user"); if (t && u) { setToken(t); setUser(JSON.parse(u)) }; setLoading(false) }, [])
  const login = async (email: string, password: string) => { const res = await authAPI.login({ email, password }); const { access_token, user: u } = res.data; localStorage.setItem("token", access_token); localStorage.setItem("user", JSON.stringify(u)); setToken(access_token); setUser(u); router.push("/dashboard") }
  const register = async (data: any) => { const res = await authAPI.register(data); const { access_token, user: u } = res.data; localStorage.setItem("token", access_token); localStorage.setItem("user", JSON.stringify(u)); setToken(access_token); setUser(u); router.push("/dashboard") }
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setToken(null); setUser(null); router.push("/") }
  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
