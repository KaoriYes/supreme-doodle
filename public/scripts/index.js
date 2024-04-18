
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


const check = () => {
    if (!('serviceWorker' in navigator)) {
        throw new Error('No Service Worker support!')
    }
    if (!('PushManager' in window)) {
        throw new Error('No Push API Support!')
    }
}
const registerServiceWorker = async () => {
    const swRegistration = await navigator.serviceWorker.register('/serviceWorker.js'); //notice the file name
    return swRegistration;
}


const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    if(permission !== 'granted'){
        throw new Error('Permission not granted for Notification');
    }
}

const showLocalNotification = (title, body, swRegistration) => {
    const options = {
        body,
        // here you can add more properties like icon, image, vibrate, etc.
    };
    swRegistration.showNotification(title, options);
}


const main = async () => {
    check();
    const swRegistration = await registerServiceWorker();
    const permission =  await requestNotificationPermission();
    showLocalNotification(`${message.id}`, `${message.Chat}`, swRegistration);
}

// main();



const es = new EventSource('http://localhost:1337/events');

const chatContainer = document.getElementById('chat-container');

document.getElementById('chat-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const id = cookieData.name;
    const chat = document.getElementById('chat').value;

    // Construct postData object
    const postData = {
        type: 'message',
        id: id,
        Chat: chat
    };

    fetch('http://localhost:1337/chat', {
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
            return response.json();
        })
        .then(data => {
            if (data) {
                renderMessage(data);

                const registerServiceWorker = async () => {
                    const swRegistration = await navigator.serviceWorker.register('/serviceWorker.js'); //notice the file name
                    return swRegistration;
                }
                const showLocalNotification = (title, body, swRegistration) => {
                    const options = {
                        body,
                        // here you can add more properties like icon, image, vibrate, etc.
                    };
                    swRegistration.showNotification(title, options);
                }

                const main = async () => {
                    check();
                    const swRegistration = await registerServiceWorker();
                    const permission =  await requestNotificationPermission();
                    showLocalNotification(`${data.id}`, `${data.Chat}`, swRegistration);
                }
                main(data);


            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
});


const renderMessage = (message) => {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `
                <p>name: ${message.id}</p>
                <p>${message.Chat}</p>
                <hr>
            `;
    chatContainer.appendChild(messageElement);
};


