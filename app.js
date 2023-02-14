const express = require('express');
const session = require('express-session');
const multer = require('multer');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const controllers = require('./controllers');
const samples = require('./controllers/samples');
const auth = require('./controllers/auth');

const dbConfig = require('./config/database');
mongoose.connect(dbConfig.uri, {
    "authSource": "admin",
    "user": dbConfig.user,
    "pass": dbConfig.pass
});

const app = express();
const secret = require('./config/session_secret');
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false},
    store: MongoStore.create({client: mongoose.connection.getClient()})
}));

const upload = multer();

app.get('/', controllers.index);
app.post('/getSamples', upload.none(), samples.get);
app.post('/addSample', upload.none(), samples.add);
app.post('/login', upload.none(), auth.login);

app.use((req, res) => {res.render('404')});

app.listen(3000);