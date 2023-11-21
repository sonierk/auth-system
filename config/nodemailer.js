const nodeMailer = require('nodemailer')
const ejs = require('ejs')
const path = require('path')

let transporter = nodeMailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      // TODO: re   place `user` and `pass` values from <https://forwardemail.net>
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    }
  });

let renderTemplate = (data, relativePath) => {
  let mailHtml;
  ejs.renderFile(
    path.join(__dirname,'../views/mailers', relativePath),
    data, 
    function(err, template){
      if(err){console.log('error in rendering template from nodemailer file'); return}
      mailHtml = template
    }
  )
  return mailHtml
}

module.exports = {
  renderTemplate: renderTemplate,
  transporter: transporter,
}