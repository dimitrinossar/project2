const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const pool = require('./database')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const flash = require('connect-flash')
const methodOverride = require('./middlewares/method_override')
const expressLayouts = require('express-ejs-layouts')
const setCurrentUser = require('./middlewares/set_current_user')
const viewHelpers = require('./middlewares/view_helpers')
const sessionController = require('./controllers/session_controller')
const userController = require('./controllers/user_controller')
const artistController = require('./controllers/artist_controller')
const releaseController = require('./controllers/release_controller')
const listingController = require('./controllers/listing_controller')

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(methodOverride)
app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    resave: false,
    secret: process.env.SECRET_KEY || 'keyboard cat',
    saveUninitialized: true,
  }),
)
app.use(flash())
app.use(expressLayouts)
app.set('layout extractStyles', true)
app.use(setCurrentUser)
app.use(viewHelpers)

app.get('/login', (req, res) => {
  res.render('login', {
    layout: false,
    loginMessage: req.flash('loginError'),
    signUpMessage: req.flash('signUpError'),
  })
})
app.use('/session', sessionController)
app.use('/user', userController)
app.use('/artist', artistController)
app.use('/release', releaseController)
app.use('/listing', listingController)
app.get('/', (req, res) => {
  const sql = `
        SELECT id, title, artist, catalog_number FROM releases;
    `
  pool.query(sql, (err, dbRes) => {
    const releases = dbRes.rows
    res.render('home', { releases })
  })
})

app.all('*', (req, res) => {
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`the server is running on port ${port}`)
})
