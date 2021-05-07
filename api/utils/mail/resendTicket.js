// const request = require("request");
// const moment = require('moment');
// var querystring = require("querystring");
const nodemailer = require("nodemailer");
const hostname = process.env.HOSTNAME;
const sampleMail = require('./sample');


const resendTicket = (event, registrations, email) => {

    let Ticket = '';

    registrations.forEach(registration => 
        Ticket += `
    <div style="width: 95%; margin:auto; background-color: #ffffff; background: linear-gradient(to right, #b6fbff, pink); border-radius: 10px; padding-left: 8px; box-shadow: 4px 4px 4px grey; border-width: 1px; border-style:solid; border-color: #e8ecee7c; margin-top: 3px;">
        <table style="width:100%">
            <tr >
                <th style='padding: 5px; text-align: left;' colSpan='3'>
                    <p>
                        <h2 style="margin: 0; text-align: center;">${registration.fullname}</h2>
                        <h2 style="margin: 0;">${registration.ticketName}</h2>
                        <h3 style="color: grey; margin: 0;">${registration.registrationNumber} </h3>
                        <h3 style="color: grey; margin: 0;">${registration.ticketPrice} ${registration.currency.abbr}</h3>
                        <img src="http://www.barcodesinc.com/generator/image.php?code=${registration._id}&style=197&type=C128B&width=200&height=50&xres=1&font=3" alt="barcode" />
                        <br />
                        <small style='text-align: center; margin-top: 1px;'><a  href='${hostname}/validate_ticket/${registration.contact}/${registration.registrationNumber}' style="color: #e61a8d;">validate ticket</a></small>
                    </p>
                </th>
                <th style='padding: 3px; text-align: right;' colSpan='3'>
                    <p><img src="http://qrfree.kaywa.com/?s=8&d=${registration._id}" alt="QRCode"/></p>
                </th>
            </tr>
        </table> 
    </div>
    `);

    let msg =  `<div>
    <div style='text-align: center'>
        <h2 style="margin: 0px;">${event.name}</h2>
        <small>Hosted by ${event.organizer.name}</small>
        <p><b>${event.time.startStr} to ${event.time.endStr}</b><p/>
        <p style="color: darkgrey;"><b>${event.location.text}</b></p>
        <br />
        <small>Visit the <a  href='${hostname}/e/${event._id}}' style="color: #e61a8d;">event page</a> for complaint and ticket related issues.</small>
        <br />
    </div>
    <br />
    ${Ticket}   
</div>`

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
    //         email_subject: `RE: ${event.name} Ticket(s)`,
    //         email_reply_to: 'prepventapp@gmail.com',
    //         email_message: `${sampleMail(msg)}`,
    //         username: 'prepvent',
    //         bulkid: querystring.escape(`Resend_Ticket:${email}-${moment.utc().valueOf()}`) 
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
            subject:  `RE: ${event.name} Ticket(s)`, // Subject line
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

{/* <img src="http://www.barcodesinc.com/generator/image.php?code=${ticket.registrationNumber}&style=197&type=C128B&width=200&height=50&xres=1&font=3" alt="barcode" /> */}

module.exports = resendTicket;