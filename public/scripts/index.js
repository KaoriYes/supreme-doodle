

let PUBLICKEY ="BEcCxLSXfWWI0jsJ28IT9kzovSlXVIcQAHyq6PolklMpvZMwdC8AGrg3cDTPDSbrjV23kQun2uizUT-K0m7Fpbo"
let cookie = decodeCookieValue(document.cookie);


function getDataFromCookie(cookie) {
    // Find the position of the colon in the cookie string
    const colonIndex = cookie.indexOf(':');

    // Extract the JSON part of the string starting from the colon
    const jsonData = cookie.substring(colonIndex + 1);

    try {
        // Parse the extracted JSON data
        const cookieData = JSON.parse(jsonData);

        // Check if 'user' object exists and has 'email' property
        if (cookieData && cookieData.user && cookieData.user.email) {
            // Return the email value
            return cookieData.user;
        } else {
            // Return null if email is not found
            return null;
        }
    } catch (error) {
        console.error('Error parsing JSON data from cookie:', error);
        return null;
    }
}
const cookieData = getDataFromCookie(cookie);
function decodeCookieValue(value) {
    return decodeURIComponent(value.replace(/\+/g, ' '));
}

// console.log(cookieData);

// const showLocalNotification = (title, body, swRegistration) => {
//     const options = {
//         body,
//         // here you can add more properties like icon, image, vibrate, etc.
//     };
//     swRegistration.showNotification(title, options);
// }
//
//
// const main = async () => {
//     check();
//     const swRegistration = await registerServiceWorker();
//     const permission =  await requestNotificationPermission();
//     showLocalNotification(`${message.id}`, `${message.Chat}`, swRegistration);
// }

// main();



const es = new EventSource('/events');

const chatContainer = document.getElementById('chat-container');

document.getElementById('chat-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const id = cookieData.name;
    const chat = document.getElementById('chat').value;
    console.log(chat)

    // Construct postData object
    const postData = {
        type: 'message',
        id,
        chat,
        icon: '../uploads/images/icon.png'
    };

    // Send the chat message to the server
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Trigger notification after chat message is successfully sent
            return fetch('/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData) // Sending the same data as chat message
            });
        })
        .then(notificationResponse => {
            if (!notificationResponse.ok) {
                throw new Error('Notification response was not ok');
            }
            console.log('Notification sent successfully');
        })
        .catch(error => {
            console.error('There was a problem:', error);
        });
});




const eventSource = new EventSource('/events');

eventSource.onmessage = (event) => {
    console.log(event.data)
    const eventData = JSON.parse(event.data); // Parse the event data as JSON
    console.log(eventData);
    if (eventData) {
        renderMessage(eventData);

        // Service Worker registration and notification functions
        // const registerServiceWorker = async () => {
        //     if ('serviceWorker' in navigator) {
        //         const swRegistration = await navigator.serviceWorker.register('/serviceWorker.js'); // Register service worker
        //         return swRegistration;
        //     } else {
        //         throw new Error('Service Worker not supported');
        //     }
        // };

        // const showLocalNotification = (title, body, swRegistration) => {
        //     const options = {
        //         body,
        //         // You can add more properties like icon, image, vibrate, etc. to customize the notification
        //     };
        //     swRegistration.showNotification(title, options); // Show local notification
        // };

        // Main function to handle service worker registration and notification
        // const main = async () => {
        //     try {
        //         const swRegistration = await registerServiceWorker();
        //         const permission = await Notification.requestPermission();
        //         if (permission === 'granted') {
        //             showLocalNotification(eventData.id, eventData.Chat, swRegistration); // Show local notification if permission granted
        //         }
        //     } catch (error) {
        //         console.error('Error:', error);
        //     }
        // };
        //
        // main(); // Call the main function
    }
};

eventSource.onerror = (error) => {
    console.error('EventSource failed:', error);
    eventSource.close();
};

// Function to render message in the chat container
const renderMessage = (message) => {
    console.log(message)
    const chatContainer = document.getElementById('chatContainer');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `
        <p>Name: ${message.id}</p>
        <p>${message.chat}</p>
        <hr>
    `;
    chatContainer.appendChild(messageElement);
};


function registerServiceWorker() {
    return navigator.serviceWorker.register('/serviceWorker.js')
        .then(function(registration) {
            // console.log('Service worker successfully registered.');
            return registration;
        })
        .catch(function(err) {
            console.error('Unable to register service worker.', err);
        });
}
// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}



function askPermission() {
    return new Promise(function(resolve, reject) {
        const permissionResult = Notification.requestPermission(function(result) {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    })
        .then(function(permissionResult) {
            if (permissionResult !== 'granted') {
                throw new Error('We weren\'t granted permission.');
            }
        });
}

function getNotificationPermissionState() {
    if (navigator.permissions) {
        return navigator.permissions.query({name: 'notifications'})
            .then((result) => {
                return result.state;
            });
    }

    return new Promise((resolve) => {
        resolve(Notification.permission);
    });
}
getNotificationPermissionState().then((state) => {
    // console.log(state);
    if (state === 'prompt') {
        askPermission();
    }
    else if (state === 'granted') {
        subscribeUserToPush();

    }
});

function subscribeUserToPush() {
    return registerServiceWorker()
        .then(function(registration) {
            if ('pushManager' in registration) {
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlB64ToUint8Array(
                        'BEcCxLSXfWWI0jsJ28IT9kzovSlXVIcQAHyq6PolklMpvZMwdC8AGrg3cDTPDSbrjV23kQun2uizUT-K0m7Fpbo'
                    )
                };

                return registration.pushManager.subscribe(subscribeOptions);
            } else {
                console.log('Push API not supported by this browser.');
            }
        })
        .then(function(pushSubscription) {
            if (pushSubscription) {
                const subscriptionObject = JSON.stringify(pushSubscription);
                sendSubscriptionToBackEnd(subscriptionObject);
                return subscriptionObject;
            }
        });
}

function sendSubscriptionToBackEnd(subscription) {
    const userId = cookieData.id;
    // console.log("account:", userId);
    return fetch(`/save-subscription/${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // body: JSON.stringify({ subscription, userId: userId }),
        // body: JSON.stringify(subscription),
        body: subscription,
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Bad status code from server.");
            }

            return response.json();
        })
        .then(function (responseData) {
            if (!(responseData.data && responseData.data.success)) {
                throw new Error("Bad response from server.");
            }
        });
}