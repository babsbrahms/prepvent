const hostname = process.env.HOSTNAME;

const sampleEmail = (msg, eventId) => `
<div>
    <h3 style='color: #e61a8d'> <a style='color: #e61a8d' href='${hostname}' target='_blank'>PrepVENT </a>  ${eventId? `<b style='color: black;'>|</b> <a href='${hostname}/e/${eventId}}' target='_blank'>visit event page </a>` : ''} </h3> 
    <div style='border: solid 1px #e61a8d; border-radius: 0 0 7px 7px;'>
        <div style='overflow-x: auto; word-break: keep-all; text-align: left; padding: 8px;'>
            ${msg}
        </div>
        <div style='background-color: #e61a8d; padding: 15px; z-index: 10px; text-align: center; border-radius: 0 0 7px 7px;'>
            <h5><a style='color: black' href='${hostname}' target='_blank'>PrepVENT </a> </h5>
            <a target='_blank' style="color: black;" href='${hostname}/privacy'>Privacy Policy</a> | <a target='_blank' style="color: black;" href='${hostname}/terms'>Terms and Conditions</a> | <a target='_blank' style="color: black;" href='${hostname}/refund'>Refund Policy</a> | <a target='_blank' style="color: black;" href='${hostname}/contact'>Contact Us</a>
        </div>
    </div>
</div>
`

module.exports = sampleEmail;

