// const request = require("request");
// const moment = require('moment');
// var querystring = require("querystring");
const nodemailer = require("nodemailer");
const hostname = process.env.HOSTNAME;
const sampleMail = require('./sample');

const LikedEventMail = (events, email) => {

    let Card = '';

    events.forEach(event => 
      Card += `
        <div style="display: flex; flex-direction: row; justify-content: flex-start; width: 100%; background-color: white; border-radius: 10px; padding-left: 8px; box-shadow: 4px 4px 4px grey; border-width: 1px; border-style:solid; border-color: #e8ecee7c; padding: 6px; margin-top: 7px;">
            <img style='width: 30%; height: auto;' src=${event.poster} />
            <div style='width: 70%; padding-left: 5px;'>
                <h3 style="margin: 0px;">${event.name}</h3>
                <span style="color: grey">${event.time.startStr}</span>
                <p>${event.location.text}</p>
                <a style="color: white; padding: 7px; border-radius: 4px; background-color: #e61a8d;" href="${hostname}/e/${event._id}">buy ticket</a>
            </div>
        </div>
        `
    );


    let msg = `
   <div>
   <h4 style="text-align: center;">Your liked events</h4>
   <p>
       ${Card}
   </p>
   </div>
   ` 


// async..await is not allowed in global scope, must use a wrapper

   

return new Promise((resolve, reject) => {
    // var options = {
    //     method: 'POST',
    //     url: 'https://mevapp.com/app/api/v2/sendMails.php',
    //     headers: {
    //       'content-type': 'multipart/form-data',
    //     },
    //     formData: {
    //         email_from: 'PrepVENT Team <info@prepvent.com>',
    //         email_to: email,
    //         email_subject: 'PrepVENT liked events',
    //         email_reply_to: 'prepventapp@gmail.com',
    //         email_message: sampleMail(msg),
    //         username: 'prepvent',
    //         bulkid: `SL${moment.utc().valueOf()}` 
    //     }
    // };


    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
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
            subject: 'PrepVENT liked events', // Subject line
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
module.exports = LikedEventMail;



// var querystring = require('querystring');
// var request = require('request');

// var form = {
//     username: 'usr',
//     password: 'pwd',
//     opaque: 'opaque',
//     logintype: '1'
// };

// var formData = querystring.stringify(form);
// var contentLength = formData.length;

// request({
//     headers: {
//       'Content-Length': contentLength,
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     uri: 'http://myUrl',
//     body: formData,
//     method: 'POST'
//   }, function (err, res, body) {
//     //it works!
//   });




// {
//     "msg": "SUCCESS-SENT",
//     "bulkid": "MEV2020Test:5"
// }