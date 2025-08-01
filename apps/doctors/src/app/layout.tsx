import type { Metadata } from "next"
import './fonts.css';
import './globals.css';
import '../styles/telemedicine.css';

export const metadata: Metadata = {
  title: "ALTAMEDICA Doctors",
  description: "Medical professionals management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
