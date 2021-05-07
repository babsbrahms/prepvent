// const request = require("request");
// const moment = require('moment');
// var querystring = require("querystring");
const nodemailer = require("nodemailer");
const sampleMail = require('./sample');

const contactMail = (letter, email, reason) => {
    let msg =  `<p>${letter}</p>`

    return new Promise((resolve, reject) => {

        // var options = {
        //     method: 'POST',
        //     url: 'https://mevapp.com/app/api/v2/sendMails.php',
        //     headers: {
        //         'content-type': 'multipart/form-data',
        //     },
        //     formData: {
        //         email_from: 'PrepVENT Team <info@prepvent.com>',
        //         email_to: email,
        //         email_subject: `PrepVENT - ${reason}`,
        //         email_reply_to: `${email || 'prepventapp@gmail.com'}`,
        //         email_message: `${sampleMail(msg)}`,
        //         username: 'prepvent',
        //         bulkid: querystring.escape(`CT${moment.utc().valueOf()}`) 
        //     }
        // };
    
                // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'shea.stiedemann@ethereal.email',
                    pass: 'SHVWeeC4KhnA95tNNV'
                }
            });

            // send mail with defined transport object
            transporter.sendMail({
                from: 'PrepVENT Team <info@prepvent.com>', // sender address
                to: email, // list of receivers
                subject: `PrepVENT - ${reason}`, // Subject line
                html: sampleMail(msg) // html body
            }).then(info => {
                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                
                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

               return resolve(info)
            })
            .catch(err => {
                console.log(err);
                return reject(err)
                
            })
        
    })
 }
 
 module.exports = contactMail;