import FirebaseInit from '@/components/firebase/FirebaseInit';
import QueryProvider from '@/components/providers/QueryProvider';
import { AuthProvider } from '@altamedica/auth';
import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

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
      <head>
        {/* 🚀 CRITICAL RESOURCE PRELOADING */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//firebaseapp.com" />
        <link rel="dns-prefetch" href="//firebase.googleapis.com" />
        <link rel="dns-prefetch" href="//firestore.googleapis.com" />
        
        {/* Preload critical 3D models */}
        <link 
          rel="preload" 
          href="/models/doctor_male.glb" 
          as="fetch" 
          crossOrigin="anonymous"
        />
        
        {/* Preload critical CSS */}
        <link rel="preload" href="/api/font-css" as="style" />
        
        {/* Performance hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
      </head>
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
