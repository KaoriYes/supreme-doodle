function handlePushEvent(event) {
    return clients.matchAll({
        type: 'window',
        includeUncontrolled: true // Include pages that are not controlled by this servicenodem worker
    })
        .then(clients => {
            // Check if any clients are currently open
            const isPageOpen = clients.some(client => client.visibilityState === 'visible');

            if (!isPageOpen) {
                // No clients are open, proceed to show the notification
                return Promise.resolve()
                    .then(() => {
                        return event.data.json();
                    })
                    .then((data) => {
                        const title = data.id;
                        const options = {
                            body: data.chat,
                            icon: data.icon,
                        };
                        return registration.showNotification(title, options);
                    })
                    .catch((err) => {
                        console.error("Push event caused an error: ", err);
                        // TODO don't show a message (in production)
                        const title = "Message Received";
                        const options = {
                            body: event.data.text(),
                        };
                        return registration.showNotification(title, options);
                    });
            } else {
                // At least one client is open, do not show the notification
                console.log('Page is open, skipping push notification.');
                return Promise.resolve();
            }
        });
}

self.addEventListener("push", function (event) {
    event.waitUntil(handlePushEvent(event));
});
self.addEventListener('notificationclick', function (event) {
    let url = 'https://supreme-doodle-wuq9.onrender.com/#chat-form';
    event.notification.close(); // Android needs explicit close.
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

