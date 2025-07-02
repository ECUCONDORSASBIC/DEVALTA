'use client';

import React from 'react';
import { Stethoscope, Heart, Shield, Activity, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-sky-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">ALTAMEDICA</span>
            </div>
            
            <p className="text-slate-300 mb-6 max-w-md">
              Revolucionamos la atención médica con tecnología de IA avanzada, 
              conectando pacientes, doctores y clínicas de manera inteligente y segura.
            </p>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-slate-300">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                <span className="text-sm">Certificación Médica</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Acceso Rápido</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Registrarse
                </button>
              </li>
              <li>
                <a href="#features" className="text-slate-300 hover:text-white transition-colors">
                  Funciones
                </a>
              </li>
              <li>
                <a href="#about" className="text-slate-300 hover:text-white transition-colors">
                  Nosotros
                </a>
              </li>
              <li>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-300">
                <Mail className="h-4 w-4 mr-3 text-sky-500" />
                <span className="text-sm">soporte@altamedica.com</span>
              </li>
              <li className="flex items-center text-slate-300">
                <Phone className="h-4 w-4 mr-3 text-sky-500" />
                <span className="text-sm">+54 9 11 4000-0000</span>
              </li>
              <li className="flex items-center text-slate-300">
                <MapPin className="h-4 w-4 mr-3 text-sky-500" />
                <span className="text-sm">Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center text-slate-300">
                <Activity className="h-4 w-4 mr-3 text-green-500" />
                <span className="text-sm">Soporte 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 ALTAMEDICA. Todos los derechos reservados.
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Términos de Servicio
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Política de Privacidad
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;