const request = require("request");

const sendSms = (msg, list, id) => {
    
    return new Promise((resolve, reject) => {

        var options = {
            method: 'POST',
            url: 'https://api.infobip.com/sms/2/text/advanced',
            headers: {
                'Authorization': '{{authorization}}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                "messages":[{
                    "from":"InfoSMS",
                    "to": list,
                    "text": msg,
                    "flash":false,
                    // "language":{"languageCode":"TR"},
                    // "transliteration":"TURKISH",
                    "intermediateReport": false,
                    "notifyUrl":"https://www.example.com/sms/advanced",
                    "notifyContentType":"application/json",
                    "validityPeriod": 720 }
                ],
                "bulkId":"BULK-ID-123-xyz",
                "tracking":{
                    "track":"SMS",
                    "type":"MY_CAMPAIGN"
                }
            })
        };
    

    
    })

}


module.exports = sendMail;