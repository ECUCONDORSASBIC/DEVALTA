import FirebaseInit from '@/components/firebase/FirebaseInit'
import { AuthProvider } from '@altamedica/auth';
import type { Metadata } from 'next'
import { Inter, Lexend } from 'next/font/google'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/providers/QueryProvider'
import './globals.css'

// Configuración optimizada de fuentes con variables CSS
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Mejora el rendimiento de carga
})

const lexend = Lexend({ 
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
})

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
    <html lang="es" className={`${inter.variable} ${lexend.variable} scroll-smooth`}>
      <body className="font-sans antialiased">
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
