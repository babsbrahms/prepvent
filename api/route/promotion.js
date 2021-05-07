const express = require('express');
const router = express.Router();
const moment = require('moment')

const Promotion = require('../model/promotion');
const Transactions = require('../model/transaction');

//  [X] 
router.post('/create_promotion', (req, res ) => {
    const { details, payment } = req.body;

    console.log('DETAILS: ', details);
    
    const userId = details[0].userId;
    const eventId = details[0].eventId;
    const cartId = details[0].cartId;

    Promotion.insertMany(details)
    .then(promo => {
        if (payment.amount > 0) {
            const transactionRef = payment.response.trxref;

            Transactions.create({
                eventId: eventId,
                userId: userId,
                email: payment.email,
                description: 'Promotion',
                totalPrice: payment.amount,
                date: payment.response.timestamp,
                transactionRef: transactionRef,
                currency: payment.currency,
                refunded: false,
                cartId: cartId
            })
            .then(() => {
                sendPromotion(req, res, eventId)
            })
            .catch(err => res.status(400).json({ msg: err.message }))
        } else {
            sendPromotion(req, res, eventId)
        } 
        
        function sendPromotion (req, res, eventId) {
            Promotion.find({ eventId}).sort({ registartionDate: -1 })
            .then(promotions => {
                res.status(200).json({ promotions})
            })
            .catch(err => res.status(400).json({ msg: err.message }))
        }
    })
    .catch(err => res.status(400).json({ msg: err.message }))

});


//  [X] GET PROMOTION
router.get('/get_promotions/:eventId', (req, res ) => {
    const { eventId } = req.params;


    console.log('eventId: ', eventId);
    
    Promotion.find({ eventId}).sort({ registartionDate: -1 })
    .then(promotions => {
        res.status(200).json({ promotions})
    })
    .catch(err => res.status(400).json({ msg: err.message }))

   // res.status(200).json({ msg: 'You have added your event your our social campaign'})
});


router.get('/get_featured_event/:state/:country', (req, res ) => {
    const { state, country } = req.params;
    // console.log({ state, country });
    // console.log(moment.utc().valueOf());
    //  
    Promotion.find({ type: 'featured event', 'data.location.country': country, 'detail.state': state, 'data.published': true, 'detail.duration.start': { "$lt" : moment.utc().valueOf() }, 'detail.duration.end': { "$gt" : moment.utc().valueOf() } }, { 'data.name': true, _id: true, 'data.poster': true, eventId: true })
    .then(promotions => {
        //console.log('promo: ', promotions);
        
        res.status(200).json({ promotions})
    })
    .catch(err => res.status(400).json({ msg: err.message }))

   // res.status(200).json({ msg: 'You have added your event your our social campaign'})
});


router.put('/add_click', (req, res) => {
    const { id } = req.body;
    console.log({ id });
    
    Promotion.updateOne({ _id: id }, { $inc: { 'analytics.clicks': 1 }})
    .then((result) => {
        console.log('result: ', result);
        
        res.status(200).json({ msg: 'promotion clicks updated'})
    })
    .catch(err => res.status(400).json({ msg: err.message }))
})

module.exports = router;