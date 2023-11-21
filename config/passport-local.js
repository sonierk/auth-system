const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')

passport.use(new LocalStrategy({
    usernameField: 'email',
},
    async (email, password, done)=> {
        try {
            console.log('Inside passport config');
            const user = await User.findOne({email: email})
            if(!user){
                console.log('Invalid username/password');
                return done(null, false)
            }
            let res = await bcrypt.compare(password, user.password)
            // console.log(res);
            if(!res){
                console.log('Invalid user/password');
                return done(null, false)
            }
            return done(null, user)
        } catch (error) {
            return done(error);
        }

    }    
))

passport.serializeUser((user,done)=> {
    done(null, user.id)
})

passport.deserializeUser(async (id,done)=>{
    try {
        const user = await User.findById(id)
        if(!user){
            console.log('Passport error');
            done(null, false)
        }
        done(null, user)
    } catch (error) {
        console.log('Error - user not found==>Passport');
    return done(err);
    }
})

// check auth 
passport.checkAuthentication = (req, res,next)=> {
    if(req.isAuthenticated()){
        return next()
    }
    return res.redirect('/users/sign-in')
}
// Set up auth user object to locals
passport.setAuthenticatedUser = (req, res, next)=>{
    if(req.isAuthenticated()){
        res.locals.user = req.user
    }
    next()
}

module.exports = passport

