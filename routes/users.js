const express = require('express')
const router = express.Router()
const userController = require('../controllers/user_controller')
const passport = require('passport')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const resetMail = require('../mailers/resetmailer')
const jwt = require('jsonwebtoken')


router.get('/sign-up', userController.signUp)
router.get('/sign-in', userController.signIn)
router.get('/profile', passport.checkAuthentication, userController.profile)
router.get('/changepass',passport.checkAuthentication, userController.changePassword)
router.post('/update/:id',userController.updatePassword)

router.get('/forget-password',  (req,res)=> {
    return res.render('forgetpassword', {
        title: 'Forget Password'
    })
})


router.post('/forget-password',async (req, res)=>{
    const { email } = req.body
    try {
        const user = await User.findOne({email: email})
        if(!user){
            console.log('User not registered');
            return res.send('User not registered')
        }
        const secret = process.env.JWT_SECRET + user.password
        const payload = {
            email: user.email,
            id: user.id
        }
        const token = jwt.sign(payload, secret, {expiresIn: '15m'})
        const link = `http://localhost:8000/users/new-pass?id=${user.id}&token=${token}`
        resetMail.resetLink(link,user)
        console.log('Next to reset email sent');
        return res.send('A password reset link has been sent to your registered email.')
    } catch (error) {
        return res.send(error.message)
    }
})

router.get('/new-pass', async (req,res)=>{
    const {id,token} = req.query
    try {
        const user = await User.findById({_id:id})
        const secret = process.env.JWT_SECRET + user.password
        const payload = jwt.verify(token,secret)
        return res.render('new_pass',{email: user.email})
    } catch (error) {
        return res.send(error.message)
    }
})

router.post('/new-pass', async (req,res)=>{
    const {id,token} = req.query
    const {newpass, confpass} = req.body
    try {
        const user = await User.findById({_id:id})
        if(!user || newpass !== confpass){
            return res.send('user not found or password mismatch')
        }
        const secret = process.env.JWT_SECRET + user.password
        const payload = jwt.verify(token,secret)
        const newPassword =  await bcrypt.hash(newpass,10)
        let passwordResetUser = await User.findOneAndUpdate({_id: id},{
            password: newPassword,    
        }, {new: true})

        return res.redirect('/')

    } catch (error) {
        return res.send(error.message)
    }
})


router.post('/reset-password',userController.resetPassword)



router.get('/pass_reset', userController.passReset)
// router.post('/new_pass',userController.resetLink)
// router.post('/pass_reset', userController.passReset)

router.post('/sign-up', userController.create)
router.post('/create-session', passport.authenticate('local',{failureRedirect: '/users/sign-in'}) ,userController.createSession)
router.get('/sign-out',userController.destroySession)

router.get('/auth/google', passport.authenticate('google',{scope: ['profile', 'email']}))
router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/users/sign-in'}), userController.createSession)

module.exports = router