import axios from "axios"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
const api = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } })
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = "Bearer " + token
  }
  return config
})
api.interceptors.response.use((res) => res, (err) => {
  if (err.response?.status === 401) {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/auth/login"
  }
  return Promise.reject(err)
})
export default api
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
}
export const complianceAPI = {
  check: (data: any) => api.post("/compliance/check", data),
  list: () => api.get("/compliance/checks"),
  get: (id: string) => api.get("/compliance/checks/" + id),
  pdf: (id: string) => api.get("/compliance/checks/" + id + "/pdf", { responseType: "blob" }),
}
export const chatAPI = {
  send: (data: any) => api.post("/chat/message", data),
  sessions: () => api.get("/chat/sessions"),
  session: (id: string) => api.get("/chat/sessions/" + id),
  deleteSession: (id: string) => api.delete("/chat/sessions/" + id),
  quickQuestions: () => api.get("/chat/quick-questions"),
}
export const dashboardAPI = { stats: () => api.get("/dashboard/stats") }
export const paymentAPI = {
  createOrder: (data: any) => api.post("/payments/create-order", data),
  verify: (data: any) => api.post("/payments/verify", data),
  history: () => api.get("/payments/history"),
}
