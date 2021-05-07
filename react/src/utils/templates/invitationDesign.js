
import emailTemplate from './emailTemplate';

const invitationDesign = (selectedEmailTemplate, invitationLetter, name, poster, hostname, link, tag, time, location, organizer, organizerName, sendingMethod, unsubcribeLink) => `
<div>
    <h3 style='color: #e61a8d;'> <a style='color: #e61a8d' href='${hostname}' target='_blank'>PrepVENT </a> <b style='color: black;'>|</b> <a href='${link}' target='_blank'>visit event page </a> <b style='color: black;'></b> </h3> 

    <div style='border: solid 1px #ffffff; border-radius: 0 0 7px 7px;'>


            ${emailTemplate[selectedEmailTemplate].style(invitationLetter, name, poster)}

        <hr></hr>
        <div style='overflow-x: auto; word-break: keep-all; text-align: center; padding: 8px;'>
            <h3>${name}</h3>

            <h4>${time.startStr} to ${time.endStr}</h4>

            <a style="font-size: 17px;" target='_blank' href='https://www.google.com/maps/place/${location.text.split(' ').join('+')}'>${location.text}</a>
            <br/>
            <br/>
            <small style='text-align: center;'>Organized by: ${organizerName} | <a href='tel:${organizer.phoneNumber || ''}'>call</a> |  <a href='mailto:${organizer.email || ''}'>email</a></small>
            <br/>
            <br/>
            <a href='${link}' target='_blank' style='background-color: #e61a8d; color: #ffffff; font-size: 18px; padding: 8px; border-radius: 15px;'>Register Now</a>
            <br/>
            <br/>
            ${(sendingMethod === 'followers list')? `<a target='_blank' style='text-align: center;' href='${unsubcribeLink}'>unsubcribe</a>` : ''}
        </div>
        <div style='background-color: #ffffff; padding: 15px; z-index: 10px; text-align: center; border-radius: 0 0 7px 7px;'>
            <h5><a style='color: black' href='${hostname}' target='_blank'>PrepVENT </a> </h5>
            
            
            <a target='_blank' style="color: black;" href='${hostname}/privacy'>Privacy Policy</a> | <a target='_blank' style="color: black;" href='${hostname}/terms'>Terms and Conditions</a> | <a target='_blank' style="color: black;" href='${hostname}/refund'>Refund Policy</a> | <a target='_blank' style="color: black;" href='${hostname}/contact'>Contact Us</a>
        </div>
    </div>
</div>
`

export default invitationDesign;