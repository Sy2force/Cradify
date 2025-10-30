/**
 * 🔄 Service Worker - Cardify PWA
 * Auteur: Shaya Coca
 * Description: Service Worker pour mise en cache et fonctionnalités offline
 */

const CACHE_NAME = 'cardify-v1.0.0';
const STATIC_CACHE = 'cardify-static-v1.0.0';
const DYNAMIC_CACHE = 'cardify-dynamic-v1.0.0';

// Ressources à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Ajoutez d'autres ressources statiques ici
];

// URLs de l'API à mettre en cache
const API_CACHE_PATTERNS = [
  /\/api\/auth\/profile/,
  /\/api\/cards/,
  /\/api\/users\/profile/
];

// URLs à ne jamais mettre en cache
const NEVER_CACHE_PATTERNS = [
  /\/api\/auth\/login/,
  /\/api\/auth\/register/,
  /\/api\/auth\/logout/,
  /\/api\/admin/
];

/**
 * Installation du Service Worker
 */
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation en cours...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Service Worker: Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation terminée');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Erreur lors de l\'installation:', error);
      })
  );
});

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Supprimer les anciens caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation terminée');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('❌ Service Worker: Erreur lors de l\'activation:', error);
      })
  );
});

/**
 * Interception des requêtes réseau
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Ne pas mettre en cache certaines URLs
  if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    return;
  }
  
  // Stratégie pour les ressources statiques
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Stratégie pour les requêtes API
  if (request.url.includes('/api/')) {
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
      event.respondWith(networkFirstStrategy(request));
    } else {
      event.respondWith(networkOnlyStrategy(request));
    }
    return;
  }
  
  // Stratégie par défaut
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Stratégie Cache First (pour les ressources statiques)
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First Strategy Error:', error);
    
    // Retourner une page offline si disponible
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    throw error;
  }
}

/**
 * Stratégie Network First (pour les données API)
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Network First: Fallback to cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Stratégie Network Only (pour les requêtes sensibles)
 */
async function networkOnlyStrategy(request) {
  return fetch(request);
}

/**
 * Gestion des messages du client
 */
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PREFETCH_ROUTES':
      prefetchRoutes(payload.routes);
      break;
      
    default:
      console.log('📨 Service Worker: Message non géré:', type);
  }
});

/**
 * Calculer la taille du cache
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

/**
 * Vider tous les caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

/**
 * Pré-charger des routes
 */
async function prefetchRoutes(routes) {
  const cache = await caches.open(STATIC_CACHE);
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
        console.log('📥 Route pré-chargée:', route);
      }
    } catch (error) {
      console.warn('⚠️ Erreur pré-chargement:', route, error);
    }
  }
}

/**
 * Gestion des notifications push
 */
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'cardify-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Gestion des clics sur les notifications
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const { action, data } = event;
  let url = '/';
  
  if (action) {
    // Actions personnalisées
    switch (action) {
      case 'view_card':
        url = `/cards/${data.cardId}`;
        break;
      case 'view_analytics':
        url = '/analytics';
        break;
      default:
        url = data.url || '/';
    }
  } else if (data && data.url) {
    url = data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Chercher une fenêtre existante
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Gestion de la synchronisation en arrière-plan
 */
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Synchronisation en arrière-plan
 */
async function doBackgroundSync() {
  try {
    // Synchroniser les données en attente
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removePendingRequest(request.id);
        console.log('✅ Requête synchronisée:', request.url);
      } catch (error) {
        console.warn('⚠️ Échec synchronisation:', request.url, error);
      }
    }
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
  }
}

/**
 * Récupérer les requêtes en attente (à implémenter avec IndexedDB)
 */
async function getPendingRequests() {
  // TODO: Implémenter avec IndexedDB
  return [];
}

/**
 * Supprimer une requête en attente
 */
async function removePendingRequest(id) {
  // TODO: Implémenter avec IndexedDB
}

console.log('🔄 Service Worker Cardify chargé et prêt!');
