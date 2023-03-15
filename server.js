const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const methodOverride = require('./middlewares/method_override');
const expressLayouts = require('express-ejs-layouts');
const setCurrentUser = require('./middlewares/set_current_user');
const viewHelpers = require('./middlewares/view_helpers');
const sessionController = require('./controllers/session_controller');
const userController = require('./controllers/user_controller');
const releaseController = require('./controllers/release_controller');
const listingController = require('./controllers/listing_controller');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride);
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    secret: process.env.SECRET_KEY || 'keyboard cat',
    saveUninitialized: true
}));
app.use(expressLayouts);
app.use(setCurrentUser);
app.use(viewHelpers);

app.get('/login', (req, res) => {
    res.render('login', {layout: false});
});
app.use('/sessions', sessionController);
app.use('/users', userController);
app.use('/releases', releaseController);
app.use('listings', listingController);
app.get('/', (req, res) => {
    const sql = `
        SELECT * FROM releases;
    `;
    res.render('home');
});

app.all('*', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`the server is running on port ${port}`);
});