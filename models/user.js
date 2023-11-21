const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: {
        type: String,
    },

    expireToken: {
        type: Boolean
    }

}, {timestamps: true})

const resetPasswordTokenSchema = new mongoose.Schema({

})


// Only run this function if password was moddified (not on other update functions)
userSchema.pre('save', async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
        next()
    }
})

const User = mongoose.model('User', userSchema)
module.exports = User