/**
 * layout.tsx - Layout Raíz de la Aplicación de Pacientes
 * Proyecto: Altamedica Pacientes
 * Diseño: Ultra-conservador con autenticación robusta
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "../providers/QueryProvider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Altamedica - Portal de Pacientes",
  description: "Portal de pacientes para gestión de citas, historial médico y telemedicina",
  keywords: "pacientes, citas médicas, telemedicina, historial médico, Altamedica",
  authors: [{ name: "Altamedica" }],
  robots: "noindex, nofollow", // Para desarrollo
};

// Configuración de viewport separada según Next.js 15
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

// AuthProvider con JWT desde contexto local
import { AuthProvider } from '@altamedica/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
