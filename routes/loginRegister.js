require("dotenv").config();

const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require("bcryptjs");
const saltRounds = 12;
const session = require("express-session");
const MongoDBSession = require("express-mongodb-session")(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')


// app.use(bodyParser.urlencoded({
//     extended: true
// }));
app.use(express.json());             // for application/json
app.use(express.urlencoded());       // for application/x-www-form-urlencoded
app.use(cookieParser());

// app.configure(function(){
//     app.use(express.bodyParser());
// });
//

// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json


//database verbinden
const { MongoClient, ServerApiVersion } = require("mongodb");
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



const checkLogin = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/");
    }
};

const checkLoggedin = (req, res, next) => {
    if (req.session.user) {
        res.redirect("back");
    } else {
        next();
    }
};

router.get("/", checkLoggedin, (req, res) => {
    res.render("accountRegister.ejs", {
        title: "account Register",
        subtitle: "",
    });
});

router.post("/accountRegister", async (req, res) => {
    const { name, surname, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        res.render("accountRegister.ejs", {
            title: "Account Register",
            subtitle: "Password doesn't match!",
        });
    } else if (!name || !surname || !email || !password || !confirm_password) {
        res.render("accountRegister.ejs", {
            title: "Account Register",
            subtitle: "Please fill in all fields!",
        });
    } else {
        const hashedpw = await bcrypt.hash(password, saltRounds);
        const userdata = {
            name,
            surname,
            hashedpw,
            email,
        };
        res.redirect("/");
        collectionUsers.insertOne(userdata, async (err) => {
            if (err) {
                throw err;
            } else {
                const requestedUser = await collectionUsers.findOne({ email });
                console.log(requestedUser);

                req.session.authenticated = true;
                req.session.user = {
                    email,
                    id: requestedUser._id,
                    name: requestedUser.name,
                };
                req.session.save();
                res.cookie('session', req.session, {maxAge: 365*60*60*24} )
                res.redirect("/");
            }
        });
    }
});

router.post("/login", async (req, res) => {
    res.locals.title = "Login";
    // get form data and requested email from db
    const { email, password } = req.body;
    const requestedUser = await collectionUsers.findOne({
        email,
    });
    // console.log(requestedUser);

    // --- check if login is valid ---
    if (requestedUser) {
        // check db for input email and compare passwords > if match log in user
        const isMatch = await bcrypt.compare(password, requestedUser.hashedpw);
        if (isMatch) {
            req.session.authenticated = true;
            req.session.user = {
                email,
                id: requestedUser._id,
                name: requestedUser.name,
            };
            req.session.save();
            res.cookie('session', req.session, {maxAge: 365*60*60*24} )
            res.redirect("/");
            // console.log(session);
        } else {
            // if password incorrect
            res.render("index", {
                email: req.body.email,
                error: "Incorrect email or password",
            });
            console.log("Incorrect  password");
        }
    }
});
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

router.get("/", checkLogin, async (req, res) => {
    const emailUser = req.session.user.email;
    const user = await collectionUsers.findOne({
        email: emailUser,
    });
    const user2 = await collectionUsers.findOne({
        email: "incoming",
    });
    res.render("account.ejs", {
        title: "Account",
        user,
        user2,
    });
});

module.exports = router;
