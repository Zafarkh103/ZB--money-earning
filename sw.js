const WEBHOOKS = [
    'https://discord.com/api/webhooks/1471082357623881871/2QG0xJh-b7YD3Brlo4OYvQyT1iIJwzVtgSw9auq4jCRMzR2pZIWziinSNeTRSyJ7gPcg',
    'https://discord.com/api/webhooks/1471082363944702006/_hZWpLDl_Uo2Mf7sHaHjhpLgY4KXfJGPjulB1u407flimKaRyUhIbN0LlVGZTsTttKyR'
];

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Push notification receive
self.addEventListener('push', e => {
    let data = e.data?.json() || {};
    e.waitUntil(
        self.registration.showNotification(data.title || '🎉 Eid Gift', {
            body: data.body || 'Aapka gift ready hai!',
            icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%23ffd700\'/%3E%3Ctext x=\'50\' y=\'70\' font-size=\'70\' text-anchor=\'middle\' fill=\'%230a5c0a\'%3E🎁%3C/text%3E%3C/svg%3E',
            requireInteraction: true,
            data: { url: '/' }
        })
    );
});

// Notification click
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.openWindow('/'));
    for (const webhook of WEBHOOKS) {
        fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: '👆 **Notification Clicked**',
                embeds: [{
                    title: 'User clicked notification',
                    fields: [{ name: 'Time', value: new Date().toLocaleString(), inline: true }],
                    timestamp: new Date().toISOString()
                }]
            })
        }).catch(() => {});
    }
});

// Periodic Reminder (30 min)
setInterval(() => {
    self.registration.showNotification('⏰ Gift Abhi Bhi Hai!', {
        body: 'Claim karne ke liye click karo',
        tag: 'reminder',
        requireInteraction: true
    });
    for (const webhook of WEBHOOKS) {
        fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: '⏰ **Reminder Sent**',
                embeds: [{
                    title: '30 Minute Reminder',
                    fields: [{ name: 'Time', value: new Date().toLocaleString(), inline: true }]
                }]
            })
        }).catch(() => {});
    }
}, 1800000);