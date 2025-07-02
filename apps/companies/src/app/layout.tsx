import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ALTAMEDICA Companies',
  description: 'Corporate platform for medical businesses and job listings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
