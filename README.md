# WebAppQ Chat Website Documentation

## Introduction

Welcome to the WebAppQ Chat website documentation. This documentation provides an overview of the features, functionality, and architecture of the WebAppQ Chat website. It aims to guide users and developers through the different aspects of the website, including setup instructions, usage guidelines, and technical details.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Architecture](#architecture)
5. [API Reference](#api-reference)
6. [Contributing](#contributing)
7. [License](#license)

## 1. Features <a name="features"></a>

The WebAppQ Chat website offers the following features:

- Real-time chat functionality allowing users to send and receive messages instantly.
- User authentication and registration system with login and registration functionalities.
- Subscription management for push notifications.
- Service Worker for handling push notifications and offline capabilities.
- Event streaming for real-time updates.
- Static file serving for CSS, images, and scripts.
- Support for MongoDB for data storage.


## 2. Installation <a name="installation"></a>
.git
To set up and run the WebAppQ Chat website locally, follow these steps:

### Prerequisites

- Node.js and npm installed on your system.
- MongoDB installed and running.

### Clone the Repository

```bash
git clone https://github.com/KaoriYes/supreme-doodle.git
cd name project
```

### Install Dependencies

```bash
npm install
```

### Set Up MongoDB

1. Install MongoDB if not already installed on your system.
2. Start the MongoDB service.

### Configure Environment Variables

1. Create a `.env` file in the root directory of the project.
2. Add the following environment variables to the `.env` file:

   ```plaintext
   MONGODB_URI=<your MongoDB connection URI>
   SECRET=<your secret key>
   PUBLICKEY=<your VAPID public key>
   PRIVATEKEY=<your VAPID private key>
   ```

   Replace `<your MongoDB connection URI>`, `<your secret key>`, `<your VAPID public key>`, and `<your VAPID private key>` with your respective values.

### Start the Server

```bash
npm start
```

### Access the Website

Once the server is running, access the WebAppQ Chat website in your web browser at [http://localhost:1337](http://localhost:1337).


## 3. Usage <a name="usage"></a>

Once the WebAppQ Chat website is running, users can:

- Register an account or log in with existing credentials.
- Access the chat interface to send and receive messages in real-time.
- Subscribe to push notifications for updates.
- Interact with the website's API endpoints for additional functionality.

## 4. Architecture <a name="architecture"></a>

The WebAppQ Chat website is built using the following technologies:

- **Frontend**: HTML, CSS, JavaScript (with EJS for templating).
- **Backend**: Node.js with Express.js framework.
- **Database**: MongoDB for data storage.
- **Authentication**: Express Session for managing user sessions.
- **Push Notifications**: Web Push for sending push notifications.
- **Service Worker**: Used to handle push notifications and provide offline capabilities.
- **Event Streaming**: Server-Sent Events (SSE) for real-time updates.

## 5. API Reference <a name="api-reference"></a>

The WebAppQ Chat website provides the following API endpoints:

- `POST /save-subscription/:id`: Endpoint for saving user subscriptions for push notifications.
- `POST /send-notification`: Endpoint for sending notifications to subscribed users.
- `POST /chat`: Endpoint for adding new chat messages.
- `POST /login`: Endpoint for user login.
- `POST /accountRegister`: Endpoint for user registration.
- `GET /logout`: Endpoint for user logout.

For detailed API documentation, refer to the source code or API documentation provided in the repository.

Sure, here's the updated "Wishlist" section:

---

## 6. Wishlist <a name="wishlist"></a>

The Wishlist outlines desired improvements and features for the WebAppQ Chat website:

### Offline Support

Implement offline support to enable users to access basic functionality even when they are offline. This feature will enhance the user experience by allowing them to continue chatting and viewing past conversations even in the absence of an internet connection.

### Improved Mobile Testing

Enhance mobile testing procedures to ensure seamless functionality and responsiveness across various mobile devices and screen sizes. Thorough testing on mobile platforms will improve the accessibility and usability of the website for mobile users.

### Deployment on Non-Local Servers

Deploy the WebAppQ Chat website on non-local servers to make it accessible to users beyond the localhost environment. Hosting the website on a remote server will enable public access and testing, facilitating broader usage and feedback collection.



## 7. License <a name="license"></a>

The WebAppQ Chat website is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code according to the terms of the license.