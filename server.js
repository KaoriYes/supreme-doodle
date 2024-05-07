require("dotenv").config();

const express = require("express");
const app = express();
const http = require('http').Server(app);
const port = 1337;
const session = require("express-session");
const MongoDBSession = require("express-mongodb-session")(session);
const cors = require('cors');
var EventSource = require('eventsource')
const webpush = require('web-push') //requiring the web-push module


app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));

app.set('view engine', 'ejs');


//files
app.use(express.static("public"));
let path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use("*/css", express.static("public/css"));
app.use("*/img", express.static(path.join(__dirname, "public/img")));
app.use("*/scripts", express.static(path.join(__dirname, "public/scripts")));


//router
// Import route files
const loginRegisterRoute = require('./routes/loginRegister');


//database verbinden
const {
    MongoClient, ServerApiVersion
} = require("mongodb");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1,
});

//
const databaseUsers = client.db("webAppQ");
const collectionUsers = databaseUsers.collection("colUsers");
const collectionSubs = databaseUsers.collection("colSubs");
const collectionSessions = databaseUsers.collection("colSessions");

//session store
const store = new MongoDBSession({
    uri: uri, collection: "colSessions", databaseName: "webAppQ",
});
const secret = process.env.SECRET;
const session1 = session({
    secret: secret, cookie: {
        maxAge: 2592000000,
    }, resave: false, saveUninitialized: false, store: store,
});
app.use(session1);
// const emailUser = session1();

app.get('/', async (req, res) => {
    const emailUser = req.session.user
    // const user = await collectionUsers.findOne({
    //     email: emailUser,
    // }); This shit is giving me a headache!!
    res.render('index', {emailUser});
});

app.get('/status', (request, response) => response.json({clients: clients.length}));


let clients = [];
let chats = [];

// ...

function eventsHandler(request, response, next) {
    const headers = {
        'Content-Type': 'text/event-stream', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);


    const clientId = Date.now();

    const newClient = {
        id: clientId, response
    };

    clients.push(newClient);
}

app.prototype.end = function (data) {
    this.response.write('event: result\n');
    // this.response.write(`data: ${data}\n\n`);
    this.response.end();
};


function saveToDatabase(subscription, userId) {
    return new Promise((resolve, reject) => {

        // Count the number of documents with the given userId
        collectionSubs.countDocuments({userId: userId})
            .then(count => {
                // Check if the userId already exists
                if (count > 0) {
                    resolve(`User ${userId} already exists in the collection.`);
                } else {
                    // If the userId doesn't exist, proceed with adding the new subscriber
                    collectionUsers.findOne({userId: userId})
                        .then(existingUser => {
                            if (!existingUser) {
                                // If the user doesn't exist, create a new subscriber
                                const newSubscriber = {
                                    subscription: subscription, userId: userId,
                                };
                                collectionSubs.insertOne(newSubscriber)
                                    .then(() => {
                                        console.log("New subscriber added:", newSubscriber);
                                        resolve(`New subscription added for user ${userId}: ${subscription}`);
                                    })
                                    .catch(error => {
                                        console.error("Error inserting new subscriber:", error);
                                        reject(error); // Reject the promise with the error
                                    });
                            } else {
                                // If the user exists, resolve with a message
                                resolve(`User ${userId} already exists in the collection.`);
                            }
                        })
                        .catch(error => {
                            console.error("Error checking if userId exists in collection:", error);
                            reject(error); // Reject the promise with the error
                        });
                }
            })
            .catch(error => {
                console.error("Error counting users:", error);
                reject(error); // Reject the promise with the error
            });
    });
}


app.post('/save-subscription/:id', async (req, res) => {
    const userId = req.params.id;
    await saveToDatabase(req.body, userId) //Method to save the subscription to Database
    res.json({message: 'success'})
})


const vapidKeys = {
    publicKey: process.env.PUBLICKEY, privateKey: process.env.PRIVATEKEY,
}


webpush.setVapidDetails('mailto:quinten.kok@hva.nl', //for testing, idk if this works
    vapidKeys.publicKey, vapidKeys.privateKey)

app.post('/send-notification', (req, res) => {
    const dataToSend = req.body; // Assuming dataToSend is provided in the form post
    console.log('Notification data received:', dataToSend);
    return getSubscriptionsFromDatabase()
        .then(function(subscriptions) {
            let promiseChain = Promise.resolve();
            for (let i = 0; i < subscriptions.length; i++) {
                const subscription = subscriptions[i];
                promiseChain = promiseChain.then(() => {
                    return triggerPushMsg(subscription.subscription, dataToSend);

                });
            }
            return promiseChain;
        })
        .then(() => {
            res.send('Notifications sent successfully');
        })
        .catch(error => {
            console.error('Error sending notifications:', error);
            res.status(500).send('An error occurred while sending notifications');
        });
});
const triggerPushMsg = function(subscription, dataToSend) {
    return webpush.sendNotification(subscription, JSON.stringify(dataToSend))
        .catch((err) => {
            if (err.statusCode === 410) {
                // return deleteSubscriptionFromDatabase(subscription._id);
            } else {
                console.log('Subscription is no longer valid: ', err);
                throw err; // Re-throw the error to propagate it to the outer promise chain
            }
        });
};

async function getSubscriptionsFromDatabase() {
    try {
        const subscriptions = await collectionSubs.find({}).toArray();
        return subscriptions;
    } catch (error) {
        console.error('Error retrieving subscriptions:', error);
        throw error;
    }
}







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
}

es.addEventListener('open', listener);
es.addEventListener('message', listener);
es.addEventListener('error', listener);


app.use('/account', loginRegisterRoute);


http.listen(port, () => {
    console.log('Running on Port: ' + port);
    // collectionSessions.deleteMany({})
    // collectionSubs.deleteMany({})
});