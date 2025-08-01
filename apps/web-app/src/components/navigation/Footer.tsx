'use client';

import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full py-6 px-6 bg-blue-50 text-center text-sm text-blue-700 border-t border-blue-100 mt-12">
    © {new Date().getFullYear()} Altamedica. Todos los derechos reservados.
  </footer>
);

export default Footer;