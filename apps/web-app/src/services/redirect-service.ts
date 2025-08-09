import { APP_URLS, getDashboardUrl, isExternalUrl } from '../config/app-urls';
import { NextRouter } from 'next/router';
import { toast } from 'sonner';

export interface RedirectOptions {
  saveCurrentPath?: boolean;
  fallbackUrl?: string;
  showLoader?: boolean;
  loaderMessage?: string;
}

/**
 * Servicio centralizado para manejar redirecciones entre aplicaciones
 */
export class RedirectService {
  /**
   * Redirige al usuario al dashboard correspondiente según su rol
   */
  static redirectToRoleDashboard(
    role: string, 
    router?: NextRouter | any,
    options?: RedirectOptions
  ): void {
    const dashboardUrl = getDashboardUrl(role as any);
    
    // Guardar la ruta actual si se solicita
    if (options?.saveCurrentPath && typeof window !== 'undefined') {
      sessionStorage.setItem('previousRoute', window.location.pathname);
    }
    
    this.performRedirect(dashboardUrl, router);
  }
  
  /**
   * Obtiene la URL de redirección después del login
   */
  static getPostLoginRedirect(role: string): string {
    // Primero verificar si hay un parámetro redirect en la URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');
      
      if (redirectParam) {
        try {
          // Decodificar y validar la URL
          const decodedUrl = decodeURIComponent(redirectParam);
          console.log('🔄 Redirect param encontrado:', decodedUrl);
          
          // Permitir redirección a cualquier app local de AltaMedica
          const allowedPorts = ['3000', '3001', '3002', '3003', '3004', '3005'];
          const urlObj = new URL(decodedUrl);
          
          if (urlObj.hostname === 'localhost' && allowedPorts.includes(urlObj.port)) {
            console.log('✅ Redirigiendo a app local:', decodedUrl);
            return decodedUrl;
          }
          
          // También permitir URLs de producción conocidas
          const allowedDomains = [
            'localhost',
            'altamedica.com',
            'patients.altamedica.com',
            'doctors.altamedica.com',
            'companies.altamedica.com',
            'admin.altamedica.com'
          ];
          
          if (allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
            console.log('✅ Redirigiendo a dominio permitido:', decodedUrl);
            return decodedUrl;
          }
        } catch (error) {
          console.error('Error decodificando redirect param:', error);
        }
      }
      
      // Verificar si hay una ruta guardada para redirección
      const savedRoute = sessionStorage.getItem('redirectAfterLogin');
      if (savedRoute) {
        sessionStorage.removeItem('redirectAfterLogin');
        return savedRoute;
      }
    }
    
    // Redirigir todos los roles a su aplicación correspondiente
    return getDashboardUrl(role as any);
  }
  
  /**
   * Guarda la ruta actual para redirección posterior
   */
  static saveCurrentRoute(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    }
  }
  
  /**
   * Realiza la redirección (interna o externa)
   */
  static performRedirect(url: string, router?: NextRouter | any, options?: RedirectOptions): void {
    // Mostrar mensaje informativo
    if (isExternalUrl(url)) {
      const appName = this.getAppNameFromUrl(url);
      toast.info(`Redirigiendo a ${appName}...`, {
        duration: 2000,
        icon: '🚀'
      });
    }
    
    // Delay para permitir que el usuario vea el mensaje
    const redirectDelay = options?.showLoader ? 1500 : 0;
    
    setTimeout(() => {
      if (isExternalUrl(url)) {
        // Si es URL externa, usar window.location
        window.location.href = url;
      } else if (router) {
        // Si es ruta interna y tenemos router, usarlo
        router.push(url);
      } else {
        // Fallback a window.location para rutas internas sin router
        window.location.href = url;
      }
    }, redirectDelay);
  }
  
  /**
   * Redirige al login guardando la ruta actual
   */
  static redirectToLogin(router?: NextRouter | any): void {
    this.saveCurrentRoute();
    this.performRedirect('/auth/login', router);
  }
  
  /**
   * Obtiene la URL base de la aplicación según el rol
   */
  static getAppUrl(role: string): string {
    switch (role) {
      case 'patient':
        return APP_URLS.patients;
      case 'doctor':
        return APP_URLS.doctors;
      case 'company':
        return APP_URLS.companies;
      case 'admin':
        return APP_URLS.admin;
      default:
        return '/';
    }
  }
  
  /**
   * Verifica si el usuario debe estar en otra aplicación
   */
  static shouldRedirectToOtherApp(currentRole: string, currentPath: string): boolean {
    // Todos los usuarios autenticados deben ir a su aplicación correspondiente
    // excepto en rutas públicas
    const publicWebAppRoutes = ['/', '/about', '/services', '/contact', '/privacy', '/terms'];
    const isOnPublicRoute = publicWebAppRoutes.some(route => currentPath === route);
    
    // Si está en una ruta pública, no redirigir
    if (isOnPublicRoute) {
      return false;
    }
    
    // Si es otro rol y está en rutas protegidas de web-app, debe redirigir
    const protectedWebAppRoutes = ['/dashboard', '/profile', '/appointments', '/auth/login'];
    return protectedWebAppRoutes.some(route => currentPath.startsWith(route));
  }
  
  /**
   * Maneja errores de redirección
   */
  static handleRedirectError(error: Error, fallbackUrl: string = '/'): void {
    console.error('Error durante redirección:', error);
    
    // Mostrar mensaje de error al usuario
    toast.error('Error al redirigir. Intentando ruta alternativa...', {
      duration: 3000,
      icon: '⚠️'
    });
    
    // Intentar redirección de fallback
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = fallbackUrl;
      }, 2000);
    }
  }
  
  /**
   * Obtiene el nombre de la aplicación desde la URL
   */
  private static getAppNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const port = urlObj.port;
      
      // Mapeo de puertos a nombres de aplicaciones
      const portToAppName: Record<string, string> = {
        '3000': 'Portal Principal',
        '3002': 'Portal Médico',
        '3003': 'Portal de Pacientes',
        '3004': 'Portal Empresarial',
        '3005': 'Panel Administrativo',
      };
      
      return portToAppName[port] || 'aplicación';
    } catch {
      return 'aplicación';
    }
  }
}

// Alias para conveniencia
export const redirectService = RedirectService;