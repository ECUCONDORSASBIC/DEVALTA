import FirebaseInit from '@/components/firebase/FirebaseInit'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/providers/QueryProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ALTAMEDICA - Portal Médico Inteligente',
  description: 'Plataforma médica avanzada que conecta pacientes, doctores y clínicas con tecnología de IA',
  keywords: 'medicina, salud, telemedicina, IA médica, consultas online, doctores',
  authors: [{ name: 'ALTAMEDICA Team' }],
  openGraph: {
    title: 'ALTAMEDICA - Portal Médico Inteligente',
    description: 'Revoluciona la atención médica con nuestra plataforma de IA avanzada',
    type: 'website',
    locale: 'es_ES',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <FirebaseInit />
          <AuthProvider>
            <div id="root">
              {children}
              <Toaster richColors />
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
