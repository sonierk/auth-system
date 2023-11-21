const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
app.use(express.static('./assets'));
require('dotenv').config() 
const connectDB = require('./config/mongoose')
const ejs = require('ejs')
const expressLayouts = require('express-ejs-layouts') 
const flash = require('connect-flash')
const customMware = require('./config/middleware')
const passportGoogle = require('./config/passport-google-oauth2-strategy')


// Use for session cookie and passport
const session = require('express-session');
const passport = require('passport')
const passportLocal = require('./config/passport-local')

app.use(express.urlencoded())
app.use(cookieParser())



// Extract style and script from subpages to layout
app.use(expressLayouts)
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// Set up ejs views
app.set('view engine', 'ejs')
app.set('views', './views')

app.use(session({
    name: 'auth-system',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: (1000 * 60 * 1000)
    }
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(passport.setAuthenticatedUser)

// Middleware setup for connect-flash and noty
app.use(flash())
app.use(customMware.setFlash)

app.use('/', require('./routes'))

const port = 8000

const start = async ()=> {
    try {
        await connectDB(process.env.MONGO_URL)
        
        app.listen(port,()=>console.log('App listening on port 8000'))
    } catch (error) {
        console.log('error', error);
    }
}

start()