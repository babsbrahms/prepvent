var jwt = require('jsonwebtoken');


function isAuthUser (req, res, next) {
    let BearHeader = req.headers.authorization;

    let token = BearHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.TOKEN_KEY, (err, valid) => {
            if (err) {
                res.status(400).json({ message: 'Invalid token. Try signing in again!'})
            } else {
                res.token = valid;
                next()
            }
        })
    } else {
        res.status(401).json({ msg: 'You are unauthorized to make this request!'})
    }
}

module.exports = isAuthUser