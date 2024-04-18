const express = require("express");
const app = express();
const session = require("express-session");
const MongoDBSession = require("express-mongodb-session")(session);
const router = express.Router();




//database verbinden
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const databaseUsers = client.db("webAppQ");
const collectionUsers = databaseUsers.collection("colUsers");

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

router.get('/sse', (req, res, next) => {
    const sse = SSE(res);

    const messages = ['first', 'second', 'third', 'fourth', 'fifth'];

    return Bluebird.each(messages, (message, index) => {
        sse.write(index, message);

        return Bluebird.delay(2000);
    })
        .then(() => {
            sse.end('qwerty');
        })
        .catch(next);
});

module.exports = router;