import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "react-hot-toast"
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = { title: "ComplianceAI", description: "Global AI Governance Platform" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: "#0A1628", color: "#fff", margin: 0 }}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ style: { background: "#112240", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }} />
        </AuthProvider>
      </body>
    </html>
  )
}
