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
  viewport: "width=device-width, initial-scale=1",
  robots: "noindex, nofollow", // Para desarrollo
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.className}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased bg-gray-50">
        <QueryProvider>
          <div id="root">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
