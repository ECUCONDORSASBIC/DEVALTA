// Redirect to main page with telemedicine section
import { redirect } from 'next/navigation';

export default function TelemedicinePage() {
  // Por ahora redirigir a la página principal
  // En el futuro, crear página dedicada de telemedicina
  redirect('/#telemedicina');
}

export const metadata = {
  title: 'Telemedicina - AltaMedica',
  description: 'Descubre nuestras soluciones avanzadas de telemedicina. Consultas médicas por videollamada con tecnología de punta.',
};