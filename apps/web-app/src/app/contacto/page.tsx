// Redirect to /contact page
import { redirect } from 'next/navigation';

export default function ContactoPage() {
  redirect('/contact');
}

export const metadata = {
  title: 'Contacto - AltaMedica',
  description: 'Contáctanos para más información sobre AltaMedica',
};