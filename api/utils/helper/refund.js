const request = require("request");

const refund = (transactionId, amount, customer_note, merchant_note, currency ) => {
    let refund_amount = amount*100;
    
    return new Promise((resolve, reject) => {
        let mySecretKey = (process.env.NODE_ENV || 'development') == 'development'? process.env.PAYSTACK_SECRET_TEST_KEY : PAYSTACK_SECRET_LIVE_KEY;
        
       // Bearer sk_{domain}_s3cr3tk3y
        var options = {
            method: 'POST',
            url: 'https://api.paystack.co/refund',
            headers: {
              'user-agent': 'Paystack-Developers-Hub',
              'content-type': 'application/json',
              authorization: `Bearer ${mySecretKey}`
            },
            body: JSON.stringify({
                "currency":currency.abbr,
                "merchant_note": merchant_note,
                "customer_note":customer_note,
                "amount": refund_amount,
                "transaction": transactionId
            })
        };
    
        request(options, (error, response, body) => {
            // if (error) throw new Error(error);
            if (error) {
                let err = JSON.parse(error)
                reject(err)
            } else {
                let res = JSON.parse(body)

                resolve(res)                
            }
        });
    })
}

module.exports = refund;