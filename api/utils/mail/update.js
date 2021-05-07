// const request = require("request");
// const moment = require('moment');
// var querystring = require("querystring");
const nodemailer = require("nodemailer");
const promotionMail = require('./promotion');
const sampleMail = require('./sample');

const updateMail = (promotions, promoName, updates, eventName, eventId, list) => {
    let emailPromotion = promotionMail(promotions, promoName)
    let msg =  `<div>
   <p>
       This message is to inform you that ${eventName} Event was editted and these are the changes:
       <ul>${updates}</ul>
       We sincerely apologize for any inconvenience this may cause and we will keep you updated for further changes.
       <br/>
       <br/>
       Regards,
       <p style='margin: 0px'>PrepVENT Team.</p>
   </p>
   ${promotions.length > 0? emailPromotion: ''}
</div>
    `

    return new Promise((resolve, reject) => {

        // var options = {
        //     method: 'POST',
        //     url: '',
        //     headers: {
        //         'content-type': 'multipart/form-data',
        //     },
        //     formData: {
        //         email_from: 'PrepVENT Team <info@prepvent.com>',
        //         email_to: list,
        //         email_subject: `${eventName} Updates`,
        //         email_reply_to: 'prepventapp@gmail.com',
        //         email_message: `${sampleMail(msg)}`,
        //         username: 'prepvent',
        //         bulkid: querystring.escape(`EU${moment.utc()}`) 
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
                to: list.toString(), // list of receivers
                subject:  `${eventName} Updates`, // Subject line
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

module.exports = updateMail;