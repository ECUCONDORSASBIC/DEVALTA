import { Stethoscope, Search, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary">
      <div className="max-w-lg mx-auto text-center p-8">
        <div className="card-elevated p-8">
          {/* Logo ALTAMEDICA */}
          <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-6">
            <Stethoscope className="h-6 w-6 text-sky-600 mr-3" />
            <span className="text-lg font-bold text-gradient-primary">
              ALTAMEDICA
            </span>
          </div>
          
          {/* Error 404 */}
          <div className="text-6xl font-bold text-sky-600 mb-4">404</div>
          
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Página no encontrada
          </h1>
          
          <p className="text-slate-600 mb-8">
            La página que buscas no existe o ha sido movida. 
            Te ayudamos a encontrar lo que necesitas.
          </p>
          
          {/* Botones de acción */}
          <div className="space-y-3">
            <Link href="/" className="btn-primary w-full flex items-center justify-center">
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Link>
            
            <button className="btn-secondary w-full flex items-center justify-center">
              <Search className="h-4 w-4 mr-2" />
              Buscar contenido
            </button>
          </div>
          
          {/* Enlaces útiles */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-3">Enlaces útiles:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link 
                href="/doctors" 
                className="text-sm text-sky-600 hover:text-sky-700 px-2 py-1 rounded hover:bg-sky-50 transition-colors"
              >
                Doctores
              </Link>
              <Link 
                href="/patients" 
                className="text-sm text-sky-600 hover:text-sky-700 px-2 py-1 rounded hover:bg-sky-50 transition-colors"
              >
                Pacientes
              </Link>
              <Link 
                href="/companies" 
                className="text-sm text-sky-600 hover:text-sky-700 px-2 py-1 rounded hover:bg-sky-50 transition-colors"
              >
                Clínicas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
