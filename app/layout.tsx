import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/frontend/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "FreelanceSupport - Professional Support Ticketing",
  description: "Professional support ticketing system for freelancers and clients",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <Navigation />
            <main>{children}</main>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
