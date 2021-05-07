const request = require("request");

const verifyAcct = (account_number, bank_code) => {
    return new Promise((resolve, reject) => {
        let mySecretKey = (process.env.NODE_ENV || 'development') == 'development'? process.env.PAYSTACK_SECRET_TEST_KEY : PAYSTACK_SECRET_LIVE_KEY;
        
       // Bearer sk_{domain}_s3cr3tk3y
       var options = {
            method: 'GET',
            url: `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
            headers: {
                'user-agent': 'Paystack-Developers-Hub',
                'content-type': 'application/json',
                authorization: `Bearer ${mySecretKey}`
            },
        };
    
        request(options, (error, response, body) => {
            // if (error) throw new Error(error);
            if (error) {       
                reject(error)
            } else {
                let res = JSON.parse(body)

                resolve(res)
            }
        });
    })
}

module.exports = verifyAcct;