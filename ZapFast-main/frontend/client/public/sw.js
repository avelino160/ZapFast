// Service Worker para Push Notifications
// Compatível com iOS, Android e Desktop

self.addEventListener('install', (event) => {
  console.log('✅ Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Receber e exibir notificações push
self.addEventListener('push', (event) => {
  console.log('📬 Push notification recebida:', event);
  
  let data = {
    title: 'ZapFast',
    body: 'Nova notificação',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'zapfast-notification',
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    data: {
      url: data.url || '/',
      ...data.data,
    },
  });

  event.waitUntil(promiseChain);
});

// Lidar com cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificação clicada:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Tentar focar em uma janela existente
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não houver janela aberta, abrir uma nova
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync (para envio offline)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  console.log('🔄 Sincronizando mensagens...');
}
