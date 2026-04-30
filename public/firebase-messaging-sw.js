self.addEventListener('push', event => {
  event.waitUntil(
    (async () => {
      const data = event.data ? event.data.json() : {};
      await self.registration.showNotification(data.title || 'ぱにいき', {
        body: data.body || '通知があります',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'paniiki',
        renotify: true,
      });
      if (navigator.setAppBadge) {
        const allClients = await clients.matchAll();
        if (allClients.length === 0) await navigator.setAppBadge(1);
      }
    })()
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      if (navigator.clearAppBadge) await navigator.clearAppBadge();
      const clientList = await clients.matchAll({ type: 'window' });
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/');
    })()
  );
});