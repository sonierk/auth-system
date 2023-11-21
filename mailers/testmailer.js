const nodeMailer = require('../config/nodemailer')

exports.loginAlert = (user)=> {
    let htmlString = nodeMailer.renderTemplate({user: user},'/userLogin.ejs')
    console.log('inside mailer');
    // console.log('template',htmlString);
    nodeMailer.transporter.sendMail({
        from: 'rksatish88@gmail.com',
        to: user.email,
        subject: 'New login',
        html: htmlString
        // text: "I hope this mail gets delivered" 
    },(err, info)=>{
        if(err){
            console.log('Error in sending email',err);
        }
        console.log("mail sent",info);
        return;
    })

}