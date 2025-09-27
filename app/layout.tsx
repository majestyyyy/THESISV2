import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { FloatingHelpButton } from "@/components/ui/help-system"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "AI-GiR - AI-Powered Learning Platform",
  description: "Transform your study materials with AI-generated quizzes and reviewers",
  generator: "v0.dev",
  icons: {
    icon: "/LOGO.png",
    shortcut: "/LOGO.png",
    apple: "/LOGO.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
          <FloatingHelpButton />
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
