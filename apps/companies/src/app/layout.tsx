import '@altamedica/firebase/client-only'; // Initialize Firebase Client
import { AuthProvider } from "@altamedica/auth";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CompanyLayoutProvider } from '@/components/layout/CompanyLayoutProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ALTAMEDICA Companies - Dashboard Empresarial',
  description: 'Plataforma corporativa para clínicas y hospitales con gestión avanzada',
  keywords: 'hospital, clínica, gestión médica, AltaMedica, dashboard empresarial',
  authors: [{ name: 'AltaMedica Platform' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <AuthProvider>
          <CompanyLayoutProvider>
            <div id="__next" className="min-h-screen">
              {children}
            </div>
          </CompanyLayoutProvider>
        </AuthProvider>
      </body>
    </html>
  )
}