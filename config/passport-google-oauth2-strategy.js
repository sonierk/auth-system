const passport = require('passport')
const googleStrategy = require('passport-google-oauth').OAuth2Strategy
const crypto = require('crypto')
const User = require('../models/user')


passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async function(accessToken, refreshToken, profile, done){
    try {
        let user = await User.findOne({email: profile.emails[0].value})
        console.log("Profile info from goodle passwport",user);
        if(user){
            return done(null, user)
        }else{
            let user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: crypto.randomBytes(20).toString('hex')
            })
            return done(null, user)
        }
    } catch (error) {
        console.log('Error in google strategy passport', error);
    }

}))

module.exports = passport

