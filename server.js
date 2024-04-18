require("dotenv").config();

const express = require("express");
const app = express();
const http = require('http').Server(app);
const port = 1337;
const session = require("express-session");
const MongoDBSession = require("express-mongodb-session")(session);
const compression = require("compression");
const mongodb = require('mongodb');
const cors = require('cors');
var EventSource = require('eventsource')
// const mongoose = require('mongoose');
const webpush = require('web-push') //requiring the web-push module

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));

app.set('view engine', 'ejs');


//files
app.use(express.static("public"));
var path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use("*/css", express.static("public/css"));
app.use("*/img", express.static(path.join(__dirname, "public/img")));
app.use("*/scripts", express.static(path.join(__dirname, "public/scripts")));


//router
// Import route files
const loginRegisterRoute = require('./routes/loginRegister');
const chatRoomRoute = require('./routes/chatRoom');


//database verbinden
const {
    MongoClient,
    ServerApiVersion
} = require("mongodb");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});


//session store
const store = new MongoDBSession({
    uri: uri,
    collection: "colSessions",
    databaseName: "webAppQ",
});
const secret = process.env.SECRET;
const session1 = session({
    secret: secret,
    cookie: {
        maxAge: 2592000000,
    },
    resave: false,
    saveUninitialized: false,
    store: store,
});
app.use(session1);
// const emailUser = session1();

app.get('/', (req, res) => {
    const emailUser = req.session.user
    res.render('index', {emailUser} );
});

app.get('/status', (request, response) => response.json({clients: clients.length}));



let clients = [];
let chats = [];

// ...

function eventsHandler(request, response, next) {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);


    const data = `data: ${JSON.stringify(chats)}\n\n`;

    response.write('id: 1\n')
    response.write('data: text chat\n\n')
    const clientId = Date.now();

    const newClient = {
        id: clientId,
        response
    };

    clients.push(newClient);

    request.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
}

app.prototype.end = function (data) {
    this.response.write('event: result\n');
    // this.response.write(`data: ${data}\n\n`);
    this.response.end();
};

//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend='') => {
    webpush.sendNotification(subscription, dataToSend)
}

const dummyDb = { subscription: null } //dummy in memory store
const saveToDatabase = async subscription => {
    // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
    // Here you should be writing your db logic to save it.
    dummyDb.subscription = subscription
}
// The new /save-subscription endpoint
app.post('/save-subscription', async (req, res) => {
    const subscription = req.body
    await saveToDatabase(subscription) //Method to save the subscription to Database
    res.json({ message: 'success' })
})

const vapidKeys = {
    publicKey: process.env.PUBLICKEY,
    privateKey: process.env.PRIVATEKEY,
}

//


webpush.setVapidDetails(
    'mailto:quintenkok@me.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
)

//function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend) => {
    webpush.sendNotification(subscription, dataToSend)
}
//route to test send notification
app.get('/send-notification', (req, res) => {
    const subscription = dummyDb.subscription //get subscription from your databse here.
    const message = 'Hello World'
    sendNotification(subscription, message)
    res.json({ message: 'message sent' })
})


app.get('/events', eventsHandler);
function sendEventsToAll(newChat) {
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(newChat)}\n\n`))
}

async function addChat(request, respsonse, next) {
    const newChat = request.body;
    chats.push(newChat);
    respsonse.json(newChat)
    return sendEventsToAll(newChat);
}

app.post('/chat', addChat);
const es = new EventSource('http://localhost:1337/events');
const listener = function (event) {
    const type = event.type;

    // console.log(`${type}: ${event.data || es.url}`);

    if (type === 'result') {
        es.close();
    }
};

es.addEventListener('open', listener);
es.addEventListener('message', listener);
es.addEventListener('error', listener);


app.use('/account', loginRegisterRoute);
app.use('/chat', chatRoomRoute);


http.listen(port, () => {
    console.log('Running on Port: ' + port);
});