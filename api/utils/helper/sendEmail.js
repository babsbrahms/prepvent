const nodemailer = require("nodemailer");
// const request = require("request");
// const Email = require('../../model/email');

const sendMail = (username, email_to, email_subject, email_message, type ) => {
    
    return new Promise((resolve, reject) => {

        // var options = {
        //     method: 'POST',
        //     url: 'https://mevapp.com/app/api/v2/sendMails.php',
        //     headers: {
        //       'content-type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         email_from: `${email_from} <${type}@prepvent.com>`,
        //         email_to,
        //         email_subject,
        //         email_reply_to: `${email_reply_to || 'prepventapp@gmail.com'}`,
        //         email_message,
        //         username: 'prepvent',
        //         bulkid: result._id
        //     })
        // };
    

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        // nodemailer.createTestAccount((err, testAccount) =>  {
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
                from: `${username} <${type}@prepvent.com>`, // sender address
                to: email_to.toString(), // list of receivers
                subject: email_subject , // Subject line
                html: email_message // html body
            }).then(info => {
                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                
                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

                resolve(info)
            })
            .catch(err => {
                console.log(err);
                reject(err)
                
            })
        });
    // })

}


module.exports = sendMail;