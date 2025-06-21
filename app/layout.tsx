import type React from "react"
import { Inter, Archivo, Dynalight } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { ClientLayout } from "./client-layout"

const inter = Inter({ subsets: ["latin"] })
const archivo = Archivo({ 
  subsets: ["latin"],
  variable: "--font-archivo"
})
const dynalight = Dynalight({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dynalight"
})

export const metadata = {
  title: "Smartjects - AI Research to Business Implementation",
  description: "Discover and implement AI innovations for your business",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${archivo.variable} ${dynalight.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
