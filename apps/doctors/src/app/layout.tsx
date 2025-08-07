import type { Metadata } from "next"
import './fonts.css';
import './globals.css';
import '../styles/telemedicine.css';
import '../utils/browser-polyfills';
import { ClientLayout } from './client-layout';
import DoctorLayout from '@/components/layout/DoctorLayout';

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
        <ClientLayout>
          <DoctorLayout>
            {children}
          </DoctorLayout>
        </ClientLayout>
      </body>
    </html>
  );
}
