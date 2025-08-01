import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://altamedica.com'),
  title: {
    default: 'AltaMedica - Plataforma Médica Digital HIPAA Certificada',
    template: '%s | AltaMedica'
  },
  description: 'Consulta médicos certificados 24/7, gestiona tu historial médico y recibe diagnósticos asistidos por IA. Plataforma segura con cumplimiento HIPAA y ISO 27001.',
  keywords: ['telemedicina', 'salud digital', 'consulta médica online', 'HIPAA certificado', 'historiales médicos', 'IA médica', 'doctores online', 'atención médica 24/7'],
  authors: [{ name: 'AltaMedica', url: 'https://altamedica.com' }],
  creator: 'AltaMedica',
  publisher: 'AltaMedica Healthcare Technologies',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AltaMedica - Tu Salud Digital, Segura y Accesible',
    description: 'Plataforma médica integral con 2,156 doctores verificados, atención 24/7 y diagnósticos con IA. HIPAA certificado.',
    url: 'https://altamedica.com',
    siteName: 'AltaMedica',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AltaMedica - Plataforma Médica Digital',
      }
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AltaMedica - Plataforma Médica Digital HIPAA Certificada',
    description: 'Consulta médicos 24/7, gestiona tu historial y recibe diagnósticos con IA.',
    images: ['/twitter-image.jpg'],
    creator: '@altamedica',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png' }
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  category: 'healthcare',
  alternates: {
    canonical: 'https://altamedica.com',
    languages: {
      'es-ES': 'https://altamedica.com/es',
      'en-US': 'https://altamedica.com/en',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
