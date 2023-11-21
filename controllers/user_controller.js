const User = require('../models/user')
const bcrypt = require('bcrypt')
const mailAlert = require('../mailers/testmailer')
const resetMail = require('../mailers/resetmailer')
const crypto = require('crypto')
const queue = require('../config/kue')
const jwt = require('jsonwebtoken')

// Page Rendering methods 
module.exports.profile = async (req, res)=> { 
    return res.render('profile', {
        title: "Profile Page"
    })
}

module.exports.signUp = async(req, res)=> {
    if(req.isAuthenticated()){
        return res.render('home', {
            title: "Home"
        })
    }else{
        return res.render('user_sign_up', {
            title: "Sign Up"
        })
    }   
}

module.exports.signIn = async (req, res)=>{
    if(req.isAuthenticated()){
        return res.render('home', {
            title: "Home"
        })
    }else{
        return res.render('user_sign_in', {
            title: "Sign In"
        })
    }
}

module.exports.changePassword = async (req, res)=> {
    console.log('redirected  to change password page');
    return res.render('changepass',{
        title: "Change Password"
    })
}
module.exports.updatePassword = async (req,res)=> {
    try {
        
        console.log('new pass',req.body.npass);
        console.log(req.params.id);
        let user = await User.findById(req.params.id)
        console.log('old pass', req.body.opass);
        let isMatch = await bcrypt.compare(req.body.opass, user.password)
        console.log('Is Matched?',isMatch);
        if(!isMatch){
            console.log('old password incorrect');
            return res.redirect('back')
        }else{
            let newPass = await bcrypt.hash(req.body.npass,10)
            let updateUser = await User.findByIdAndUpdate(req.params.id,{password: newPass})
            // console.log(user.password);
            req.flash('success', 'Password sucessfully updated!!!')
            return res.redirect('/')
        } 
    } catch (error) {
        console.log('Internal server error',error);
    }
}

// module.exports.forgetPassword = async (req,res)=> {
//     return res.render('forgetpassword', {
//         title: 'Forget Password'
//     })
// }

module.exports.resetPassword = async(req, res)=>{
    try {
        console.log(req.body.email);
    let user = await User.findOne({email: req.body.email})
    console.log(user);
    if(!user){
        console.log('user not found');
    }
    // let newToken = crypto.generateKey
    let randPass = await crypto.randomBytes(8).toString('hex')
    let newPass = await bcrypt.hash(randPass,10)
    let resetUser = await User.findOneAndUpdate({email: req.body.email},{
        password: newPass,
        // resetToken: crypto.randomBytes(8).toString('hex'),

        // expireToken: false,

    }, {new: true})
    // mailAlert.loginAlert(resetUser)
    resetMail.resetLink(randPass,resetUser)
    console.log(resetUser);
    res.redirect('back')
    } catch (error) {
        console.log('Error resetting password');
    }
}

module.exports.passReset = (req, res)=> {
    res.render('reset_password')
}

module.exports.resetLink = async (req, res)=> {
    try {
        // if(req.query.id && req.query.email){
        //     let user = await User.findById(req.query.id)
        //     console.log(user);
        //     return res.redirect('back')
        // }
        // const {newpass, confirmpass } = req.body
        // console.log(newpass,confirmpass);
        console.log('Request query',req.query);
        return res.render('new_pass')

        // let isTokenExpire = await User.find
        // return res.send('Password reset successfull')
    } catch (error) {
        console.log(error);
    }
}

//Methods or Actions on the user models 

module.exports.create = async (req,res)=>{
    const {name, email } = req.body
    try {
        console.log(req.body);
        if(req.body.password != req.body.confirmpassword){
            console.log('password missmatch');
            return res.redirect('back')
        }
        let user = await User.findOne({email: req.body.email})
        if(user){
            console.log('User already exist')
            return res.render('user_sign_in') 
        }else{
            await User.create(req.body)
            return res.render('user_sign_in')
        }
        
    } catch (error) {
        console.log('Error creating user', error);
    }
}

module.exports.createSession = async (req,res)=> {
    //Password attached a user object in the req => req.user
    const {email} = req.user
    console.log('request!!',email);
    let user = await User.findOne({email});
    // console.log('user found',user);
    // mailAlert.loginAlert(user)
    let job = queue.create('emails', user).save(function(err){
        if(err){
            console.log('Error in sending to the q',err);
            return
        }
        console.log('job enqueued', job.id);
    })
    req.flash('success',"Logged In Successfully!!")
    return res.redirect('/')
}

module.exports.destroySession =  (req, res)=> {
    req.logout(req.user,err=>{
        if(err) return next(err)
        req.flash('success','Logged Out successfully')
        res.redirect('/users/sign-in')
    })
    
    
}







