const CACHE_NAME = 'altamedica-v1.0.0';
const STATIC_CACHE = 'altamedica-static-v1.0.0';
const DYNAMIC_CACHE = 'altamedica-dynamic-v1.0.0';
const TELEMEDICINE_CACHE = 'altamedica-telemedicine-v1.0.0';

// Archivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
  '/styles/globals.css',
  '/api/health'
];

// Rutas de telemedicina que requieren cache especial
const TELEMEDICINE_ROUTES = [
  '/telemedicine',
  '/api/telemedicine',
  '/api/telemedicine/stats',
  '/api/telemedicine/sessions',
  '/ai-diagnosis'
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  STATIC_FIRST: 'static-first',
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  NETWORK_ONLY: 'network-only'
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache de archivos estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      
      // Cache de telemedicina
      caches.open(TELEMEDICINE_CACHE).then((cache) => {
        console.log('[SW] Caching telemedicine files');
        return cache.addAll([
          '/telemedicine',
          '/api/telemedicine/health'
        ]);
      })
    ]).then(() => {
      console.log('[SW] Service Worker installed successfully');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Installation failed:', error);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== TELEMEDICINE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar control inmediatamente
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service Worker activated successfully');
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests no-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Estrategia para archivos estáticos
  if (isStaticFile(url.pathname)) {
    event.respondWith(staticFirstStrategy(request));
    return;
  }
  
  // Estrategia para telemedicina
  if (isTelemedicineRoute(url.pathname)) {
    event.respondWith(networkFirstStrategy(request, TELEMEDICINE_CACHE));
    return;
  }
  
  // Estrategia para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }
  
  // Estrategia por defecto
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'AltaMedica',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: '/'
    }
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/icons/open.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/icons/close.png'
        }
      ],
      requireInteraction: true,
      tag: 'altamedica-notification'
    })
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (self.clients.openWindow) {
        const url = event.notification.data?.url || '/';
        return self.clients.openWindow(url);
      }
    })
  );
});

// Background sync para telemedicina
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'telemedicine-sync') {
    event.waitUntil(syncTelemedicineData());
  }
  
  if (event.tag === 'notifications-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Funciones auxiliares
function isStaticFile(pathname) {
  return STATIC_FILES.some(file => pathname === file) ||
         pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/icons/') ||
         pathname.startsWith('/images/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js');
}

function isTelemedicineRoute(pathname) {
  return TELEMEDICINE_ROUTES.some(route => pathname.startsWith(route));
}

// Estrategia: Cache First para archivos estáticos
async function staticFirstStrategy(request) {
  try {
    // Intentar cache primero
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no está en cache, ir a red
    const networkResponse = await fetch(request);
    
    // Cachear la respuesta para futuras requests
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static first strategy failed:', error);
    
    // Fallback a página offline
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Estrategia: Network First para contenido dinámico
async function networkFirstStrategy(request, cacheName) {
  try {
    // Intentar red primero
    const networkResponse = await fetch(request);
    
    // Cachear respuesta exitosa
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    
    // Fallback a cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback a página offline para documentos
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Sincronización de datos de telemedicina
async function syncTelemedicineData() {
  try {
    console.log('[SW] Syncing telemedicine data...');
    
    // Sincronizar sesiones activas
    const response = await fetch('/api/telemedicine/sessions/active', {
      headers: {
        'Authorization': `Bearer ${await getStoredToken()}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Actualizar cache con datos frescos
      const cache = await caches.open(TELEMEDICINE_CACHE);
      const request = new Request('/api/telemedicine/sessions/active');
      cache.put(request, response.clone());
      
      console.log('[SW] Telemedicine data synced successfully');
    }
  } catch (error) {
    console.error('[SW] Telemedicine sync failed:', error);
  }
}

// Sincronización de notificaciones
async function syncNotifications() {
  try {
    console.log('[SW] Syncing notifications...');
    
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getStoredToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lastSync: await getLastSyncTime()
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Mostrar notificaciones no leídas
      data.notifications.forEach(notification => {
        if (!notification.read) {
          self.registration.showNotification(notification.title, {
            body: notification.message,
            icon: '/icons/icon-192x192.png',
            data: { url: `/notifications/${notification.id}` }
          });
        }
      });
      
      await setLastSyncTime(new Date().toISOString());
      console.log('[SW] Notifications synced successfully');
    }
  } catch (error) {
    console.error('[SW] Notifications sync failed:', error);
  }
}

// Obtener token almacenado
async function getStoredToken() {
  try {
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      if (client.url.includes(self.location.origin)) {
        // Intentar obtener token del localStorage del cliente
        const result = await client.evaluate(() => {
          return localStorage.getItem('token');
        });
        if (result) return result;
      }
    }
    return null;
  } catch (error) {
    console.error('[SW] Error getting stored token:', error);
    return null;
  }
}

// Obtener última sincronización
async function getLastSyncTime() {
  try {
    const cache = await caches.open('altamedica-sync');
    const response = await cache.match('last-sync');
    if (response) {
      return await response.text();
    }
    return null;
  } catch (error) {
    console.error('[SW] Error getting last sync time:', error);
    return null;
  }
}

// Establecer última sincronización
async function setLastSyncTime(time) {
  try {
    const cache = await caches.open('altamedica-sync');
    const response = new Response(time);
    await cache.put('last-sync', response);
  } catch (error) {
    console.error('[SW] Error setting last sync time:', error);
  }
}

// Manejo de errores global
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

// Mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
}); 