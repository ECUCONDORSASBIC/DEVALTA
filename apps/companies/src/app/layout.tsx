// import '@altamedica/firebase/client-only'; // Initialize Firebase Client - Comentado hasta build
import { AuthProvider } from "@altamedica/auth';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ALTAMEDICA Companies - Dashboard Empresarial',
  description: 'Plataforma corporativa para clínicas y hospitales con gestión avanzada',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.variable}>
        <AuthProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}