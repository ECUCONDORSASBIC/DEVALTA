import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Altamédica Companies - Plataforma de Talento Médico",
  description: "Conecta con los mejores profesionales médicos y optimiza tu proceso de reclutamiento sanitario con la plataforma integral de Altamédica.",
  keywords: "reclutamiento médico, empleos sanitarios, contratación de médicos, profesionales médicos, talento sanitario",
  openGraph: {
    title: "Altamédica Companies - Plataforma de Talento Médico",
    description: "Conecta con los mejores profesionales médicos y optimiza tu proceso de reclutamiento sanitario.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div id="skip-nav" className="sr-only">
          <a 
            href="#main-content" 
            className="absolute top-0 left-0 bg-blue-600 text-white p-2 m-2 transform -translate-y-full focus:translate-y-0 transition-transform"
          >
            Saltar al contenido principal
          </a>
        </div>
        {children}
      </body>
    </html>
  );
}
