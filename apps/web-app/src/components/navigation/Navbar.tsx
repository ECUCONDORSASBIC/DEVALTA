'use client';

import React, { useState, useEffect } from 'react';
import { Stethoscope, Menu, X, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userProfile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarClasses = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300
    ${transparent && !isScrolled 
      ? 'bg-transparent' 
      : 'bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20'
    }
  `;

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-sky-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className={`text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent ${
                transparent && !isScrolled ? 'text-white' : ''
              }`}>
                ALTAMEDICA
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a 
                href="#features" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  transparent && !isScrolled 
                    ? 'text-white hover:text-sky-200' 
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                Funciones
              </a>
              <a 
                href="#about" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  transparent && !isScrolled 
                    ? 'text-white hover:text-sky-200' 
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                Nosotros
              </a>
              <a 
                href="#contact" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  transparent && !isScrolled 
                    ? 'text-white hover:text-sky-200' 
                    : 'text-gray-700 hover:text-sky-600'
                }`}
              >
                Contacto
              </a>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              // Usuario autenticado
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className={`font-medium ${
                      transparent && !isScrolled ? 'text-white' : 'text-gray-900'
                    }`}>
                      {userProfile?.firstName || 'Usuario'}
                    </div>
                    <div className={`text-xs capitalize ${
                      transparent && !isScrolled ? 'text-sky-200' : 'text-gray-500'
                    }`}>
                      {userProfile?.userType || 'Miembro'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Dashboard
                </button>
                
                <button
                  onClick={handleSignOut}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    transparent && !isScrolled
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Salir
                </button>
              </div>
            ) : (
              // Usuario no autenticado
              <>
                <button
                  onClick={() => window.location.href = '/login'}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    transparent && !isScrolled
                      ? 'text-white hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </button>
                
                <button
                  onClick={() => window.location.href = '/register'}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${
                transparent && !isScrolled 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-white/20 mt-2">
              <a
                href="#features"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Funciones
              </a>
              <a
                href="#about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nosotros
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </a>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                {user ? (
                  // Usuario autenticado - Mobile
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {userProfile?.firstName || 'Usuario'}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {userProfile?.userType || 'Miembro'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        window.location.href = '/dashboard';
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                    >
                      Ir al Dashboard
                    </button>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  // Usuario no autenticado - Mobile
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        window.location.href = '/login';
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50 flex items-center"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Iniciar Sesión
                    </button>
                    
                    <button
                      onClick={() => {
                        window.location.href = '/register';
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;