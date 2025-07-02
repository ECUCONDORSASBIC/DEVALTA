import type { Metadata } from "next"
import './globals.css';;
import "./globals.css";

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
