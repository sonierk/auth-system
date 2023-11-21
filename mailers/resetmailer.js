const nodeMailer = require('../config/nodemailer')

// exports.resetLink = (user)=> {
    exports.resetLink = (link,user)=> {
    // let htmlString = nodeMailer.renderTemplate({user: user},'/resetmailer.ejs')
    console.log('inside mailer');
    // console.log('template',htmlString);
    nodeMailer.transporter.sendMail({
        from: 'rksatish88@gmail.com',
        to: user.email,
        subject: 'Password reset link',
        // html: htmlString
        html: `<h1> Hey ${user.name}, click the <a href="${link}">Link</a> to reset your password! </h1>`
        // text: "I hope this mail gets delivered" 
    },(err, info)=>{
        if(err){
            console.log('Error in sending email',err);
        }
        console.log("mail sent",info);
        return;
    })
}