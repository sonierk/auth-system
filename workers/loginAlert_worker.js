const queue = require('../config/kue')
const loginAlertMailer = require('../mailers/testmailer')

queue.process('emails', function(job, done){
    console.log('Emails worker is processing a job', job.data);
    loginAlertMailer.loginAlert(job.data)
    done()
})