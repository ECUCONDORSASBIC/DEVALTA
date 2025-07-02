import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../hooks/useAuth'
import { PatientLayoutErrorBoundary } from '../components/layout/PatientLayout'

export const metadata: Metadata = {
  title: 'ALTAMEDICA Patients',
  description: 'Portal del paciente - Gestión de salud integral',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <PatientLayoutErrorBoundary>
          <AuthProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </PatientLayoutErrorBoundary>
      </body>
    </html>
  )
}
