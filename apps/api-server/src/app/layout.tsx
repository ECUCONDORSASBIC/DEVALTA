import './globals.css';

export const metadata = {
  title: 'AltaMedica - Mapa de Oportunidades',
  description: 'Encuentra las mejores oportunidades laborales en el sector sanitario español',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
