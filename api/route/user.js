const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');


const User = require('../model/user')
const verifyAcct = require('../utils/helper/verifyAcct')
const isUserAuth = require('../middleware/user');


// [x] add the data and return token
router.post('/create_user', (req, res) => {
    const { user }= req.body;

    console.log('create user: ', user);
    
    User.create(user)
    .then(user => {
        user.token = getToken(user);
        res.status(200).json({ user: user })
    })
    .catch((er) => {
        res.status(404).json({ msg: er.message })
    })

});

// [x] fetch and return user and {} if user is empty
router.get('/user_login/:uid', (req, res) => {
    const { uid } = req.params;
    
    User.findOne({ firebaseId: uid })
    .then(user => {
        if (user) {   
            user.token = getToken(user)
            res.status(200).json({ user: user })
        } else {
           res.json({ error: 'User does not exist' })  
        }
    })
    .catch((er) => {
        res.status(400).json({ msg: er.message })
    })

});

// [x]
router.put('/user_update', (req, res) => {
    const { user } = req.body;
    
    User.findOneAndUpdate(
        { _id: user._id }, 
        { $set: { 
            photoUrl: user.photoUrl, 
            name: user.name, 
            email: user.email, 
            phoneNumber: user.phoneNumber,
            description: user.description,
            // payment: user.payment
            }
        },
        { new: true })
    .then(myUser => {
        if (myUser) {
            myUser.token = getToken(myUser);
            res.status(200).json({ user: myUser })
        } else {
            res.json({ error: 'User does not exist' })  
        }
    })
    .catch((er) => {
        res.status(400).json({ msg: er.message })
    })
});


// [x]
router.put('/user_payment_update', (req, res) => {
    const { userId, payment } = req.body;

    User.findOneAndUpdate({ _id: userId }, { $set: { payment: payment }}, { new: true })
    .then(myUser => {
        if (myUser) {
            myUser.token = getToken(myUser);
            res.status(200).json({ user: myUser })
        } else {
            res.json({ error: 'User does not exist' })  
        }
    })
    .catch((er) => {
        res.status(400).json({ msg: er.message })
    })
});


//[x] verify user bank account
router.get('/verify_bank_account/:account_number/:bank_code', (req, res) => {
    const {account_number, bank_code} = req.params;

    console.log({account_number, bank_code});

    verifyAcct(account_number, bank_code)
    .then(body =>{
        if (body.status) {
            res.status(200).json({ msg: body })
        } else {
            res.json({ error: body.message })
        }
        
    })
    .catch(error => {
        console.log(error);
        
        res.status(404).json({ msg: error.message })  
    })
})


function getToken(user) {
    return jwt.sign({
    ...user
    }, '1223332dsfsdfd')
} 

module.exports = router