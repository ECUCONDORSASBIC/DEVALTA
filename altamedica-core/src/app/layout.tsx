// Layout Principal de Altamedica
// Sistema Médico Integral con Compliance HIPAA para Argentina

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { AuditoriaHIPAA } from "@/components/security/AuditoriaHIPAA"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Altamedica - Sistema Médico Integral",
  description: "Plataforma médica con compliance HIPAA para Argentina. Gestión de pacientes, citas, telemedicina y más.",
  keywords: ["medicina", "argentina", "hipaa", "telemedicina", "gestión médica"],
  authors: [{ name: "Eduardo - Altamedica" }],
  robots: "noindex, nofollow", // Por seguridad médica
  themeColor: "#0066CC",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="hipaa-compliant" content="true" />
        <meta name="medical-system" content="altamedica" />
        <meta name="security-level" content="high" />
      </head>
      <body className={`${inter.className} antialiased bg-medical-background min-h-screen`}>
        <Providers>
          <AuditoriaHIPAA />
          <main className="relative">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
