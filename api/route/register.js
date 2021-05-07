const express = require('express')
const router = express.Router();
const moment = require('moment');

const { Parser } = require('json2csv');

const Event = require('../model/event')
const Registrations = require('../model/registration');
const Ticket = require('../model/ticket');
const Subscriber = require('../model/subscriber')
const StateCount = require('../model/state_count')
const Organizer = require('../model/organizer');
const Contact = require('../model/contact');
const User = require('../model/user');
const Transactions = require('../model/transaction');
const Email = require('../model/email')

const sendEmail = require('../utils/helper/sendEmail')

const contactMail = require('../utils/mail/contact');
const likedMail = require('../utils/mail/likedMail');
const resendTicket = require('../utils/mail/resendTicket');



//[x] get subscriber for states
router.get('/get_country_subscribers_count/:country', (req, res) => {
    const {country} = req.params;

    StateCount.find({ country: country, count: { '$gt': 0 } })
    .then(subs => {
        res.status(200).json({ states: subs })
    })
    .catch((er) => {
        res.status(400).json({ msg: er.message })
    })
})

//  [x]  follow an event organizer
router.post('/organizer_subscription', (req, res) => {
    const { email, subscribe, organizerId } = req.body.data;
    Organizer.update(
        { $and: [{email: email}, {organizerId: organizerId}] }, 
        { $set: { subscribe, email, organizerId }}, 
        { upsert: true }
    ).then(follow => {
        console.log('follower', follow);
        if (follow.upserted || (follow.nModified === 1)) {
            User.updateOne({ _id: organizerId }, { $inc: { followerCount: 1 }})
            .then(() => {
                res.status(200).json({ msg: 'You are now following the event organizer'})
            })
            .catch((er) => {
                res.status(404).json({ msg: er.message })
            })
        } else {
            res.status(200).json({ msg: 'You are now following the event organizer'})
        }
    })
    .catch((er) => {
        res.status(400).json({ msg: er.message })
    })
   // res.status(200).json({ msg: 'You are now following the event organizer'})
})



// [] send liked event by mail
router.post('/send_likes', (req, res) => {
    const { email, events, subscribe } = req.body.data;

    //console.log(subscribe.location);
    
    likedMail(events, email)
    .then(() => {
        if (subscribe.subscribe) {
            const subscriptions = subscribe.location.map(location => ({
                updateOne: {
                    "filter" : { $and: [{state: location.state}, {email: email}, {country: location.country}] },
                    "update" : { $set: { subscribe: subscribe.subscribe, email, state: location.state, country: location.country  } },
                    upsert: true
                }})
            );
            console.log(subscriptions);
            
            Subscriber.bulkWrite(subscriptions).then((follow) => {
                // console.log('FOLLOW: ', follow);
                // console.log('UPSERTED: ', follow.result.upserted);
                
                let list = [];
        
                if (follow.result.upserted.length > 0) {
                    follow.result.upserted.forEach(dt => {
                        console.log(subscribe.location[dt.index]);
                        let selected = subscribe.location[dt.index];
                        list.push({
                            updateOne: {
                                "filter" : { state: selected.state, country: selected.country },
                                "update" : { 
                                    $set: { state: selected.state, country: selected.country },
                                    $inc: { count: 1 },
                                },
                                "upsert": true
                            }
                        });
                    })
            
                    StateCount.bulkWrite(list)
                    .then(() => {
                        // respond
                        res.status(200).json({ msg: 'Your liked events have successfully been sent to your mail'})
                    })
                    .catch((er) => {
                        res.status(401).json({ msg: er.message })
                    })
                } else {
                    res.status(200).json({ msg: 'Your liked events have successfully been sent to your mail'})
                }
        
            })
            .catch((err) => {
                res.status(401).json({ msg: 'problem registering for event updates' })
            })

        } else {
            res.status(200).json({ msg: 'Your liked events have successfully been sent to your mail'})
        }
    })
    .catch(() => {
        res.status(400).json({ msg: 'Problem sending liked events!'})
    })    
})



// [X] register for prepvent event update
router.put('/update_subscriptions', (req, res) => {
    const { subscribe, email, states, country  } = req.body.data;

    const subscriptions = states.map(state => ({
        updateOne: {
            "filter" : { $and: [{state: state}, {email: email}, {country: country}] },
            "update" : { $set: { subscribe, email, state, country  } },
            upsert: true
        }})
    );

    Subscriber.bulkWrite(subscriptions).then((follow) => {
        console.log('FOLLOW: ', follow);
        console.log('UPSERTED: ', follow.result.upserted);
        
        let list = [];

        if (follow.result.upserted.length > 0) {
            follow.result.upserted.forEach(dt => {
                console.log(states[dt.index]);
                let state = states[dt.index];
                list.push({
                    updateOne: {
                        "filter" : { state: state, country },
                        "update" : { 
                            $set: { state , country },
                            $inc: { count: 1 },
                        },
                        "upsert": true
                    }
                });
            })
    
            StateCount.bulkWrite(list)
            .then(() => {
                // respond
                res.status(200).json({ msg: 'You have successfully registered for event update'})
            })
            .catch((er) => {
                res.status(401).json({ msg: er.message })
            })
        } else {
            res.status(200).json({ msg: 'You have successfully registered for event update'})
        }

    })
    .catch((err) => {
        res.status(401).json({ msg: 'problem registering for event updates' })
    })

    // res.status(200).json({ msg: 'You have successfully registered for event update'})
})


// [x] register for prepvent event update
router.get('/get_subscriptions/:email/:country', (req, res) => {
    const { email, country } = req.params;
    
    Subscriber.find({ email, country, subscribe: true })
    .then((states) => {
        res.status(200).json({ states: states })  
    })
    .catch((er) => {
        res.status(401).json({ msg: er.message })
    })
})


// [x] to add and remove subscription
router.put('/manage_subscriptions', (req, res) => {
    const { data } = req.body;
   // const { subscriptions, stateCount } = req.body;
    
    const subscriptions = data.map(doc => {
        if (doc.subscribe)  {
            return { insertOne: { "document": doc } }
        } else {
            return { deleteOne : { "filter" : { "$and": [{state: doc.state}, {email: doc.email}, {country: doc.country}]} } }
        }
    });

    Subscriber.bulkWrite(subscriptions).then((follow) => {
        console.log('subs: ', follow);
        console.log('UPSERTED: ', follow.result.upserted);

        let stateCount = data.map(target => {
            if (target.subscribe)  {
                return {
                        updateOne: {
                            "filter" : { state: target.state, country: target.country },
                            "update" : { 
                                $set: { state: target.state, country: target.country },
                                $inc: { count: 1 },
                            },
                            "upsert": true
                        }
                    }
            } else {
                return {
                    updateOne: {
                        "filter" : { state: target.state, country: target.country },
                        "update" : { 
                            $set: { state: target.state, country: target.country },
                            $inc: { count: -1 },
                        },
                    }
                }
            }
        });;

        StateCount.bulkWrite(stateCount)
        .then(() => {
            // respond
            res.status(200).json({ msg: 'You have successfully updated your event subscriptions' })
        })
        .catch((er) => {
            res.status(401).json({ msg: er.message })
        })


    })
    .catch((err) => {
        res.status(401).json({ msg: err.message })
    })
 
})



// [x] send complain or about an event  event or general 
// send email if sendCopy == true
router.post('/send_contact', (req, res) => {
    const { name, email, reason, message, sendCopy, eventId, eventName } = req.body.data;

    console.log({ name, email, reason, message, sendCopy, eventId, eventName });
    
    // eventId: id || null
    // eventName: name || null
    Contact.create({
        name: name, 
        email: email, 
        reason: reason,
        message: message,
        sendCopy: sendCopy, 
        resolved: false , 
        byPrepvent: false,
    })
    .then(() => {
        if (sendCopy) {

            contactMail(message, email, reason)
            .then(() => {
                res.status(200).json({ msg: 'We have recieved your message. We will get back to you soon!'})
            })
            .catch(() => {
                res.status(400).json({ msg: 'We have recieved your message. We will get back to you soon!'})
            })
        } else {
            res.status(200).json({ msg: 'We have recieved your message. We will get back to you soon!'})    
        }
    })
    .catch((er) => {
        res.status(401).json({ msg: er.message })
    })

    // res.status(200).json({ msg: 'We have recieved your message. We will get back to you soon!'})
})


// [] send email using imported list
router.post('/send_bulk_email', ( req, res) => {
    const { subject, msg, payment, list, userId, eventId, userName, userEmail, type } = req.body.data;
    
    const transactionRef = payment.response.trxref || '';

    Transactions.create({
        eventId: eventId,
        userId: userId,
        email: payment.email,
        description: 'Email Messaging',
        totalPrice: payment.amount,
        date: payment.response.timestamp,
        transactionRef: transactionRef,
        currency: payment.currency,
        refunded: false
    })
    .then(() => {
        Email.create({
            eventId,
            userId,
            type,
            email_from: `${userEmail} <${type}@prepvent.com>`, 
            email_to: list, 
            email_subject: subject, 
            email_reply_to: userEmail, 
            email_message: msg,
            sent: true
        })
        .then(result => {
            sendEmail(userName, list, subject, msg, type)
            .then(() => {
                res.status(200).json({ msg: 'We have started sending your email message'})
            })
            .catch(() => {
                Email.updateOne({ _id: result._id }, { $set: { sent: false }})
                .then(() => {
                    res.status(400).json({ msg: 'Problem sending your email. We will send resend it later.'})
                })
                .catch(err => res.status(400).json({ err: err.message }))
            })
        })
        .catch(err => res.status(400).json({ err: err.message }))
    })
    .catch(err => res.status(400).json({ msg: err.message }))

})


// [] send sms using imported list
router.post('/send_bulk_sms', ( req, res) => {
    const { msg, payment, list, userId, eventId, userName, userEmail, type } = req.body.data;

    const transactionRef = payment.response.trxref || '';

    Transactions.create({
        eventId: eventId,
        userId: userId,
        email: payment.email,
        description: 'Sms Messaging',
        totalPrice: payment.amount,
        date: payment.response.timestamp,
        transactionRef: transactionRef,
        currency: payment.currency,
        refunded: false
    })
    .then(() => {
        res.status(200).json({ msg: 'We have started sending your sms message'})
    })
    .catch(err => res.status(400).json({ msg: err.message }))

    
})



// [] send email to followers
router.post('/send_follower_email', ( req, res) => {
    const { subject, msg, payment, userId, eventId, userName, userEmail, type } = req.body.data;

    const transactionRef = payment.response.trxref || '';

    Transactions.create({
        eventId: eventId,
        userId: userId,
        email: payment.email,
        description: 'Email Messaging',
        totalPrice: payment.amount,
        date: payment.response.timestamp,
        transactionRef: transactionRef,
        currency: payment.currency,
        refunded: false
    })
    .then(() => {
        // Organizer.aggregate([
        //     { $match: { organizerId: userId }},
        //     { $group: { "_id": null, emails:{$push:"$email"} } },
        // ])
        Organizer.find({ organizerId: userId  }, { email: true })
        .then((list) => {
            console.log(list);
            if ((list.length > 0)) {
                Email.create({
                    eventId,
                    userId,
                    type,
                    email_from: `${userEmail} <${type}@prepvent.com>`, 
                    email_to: list.map(x => x.email), 
                    email_subject: subject, 
                    email_reply_to: userEmail, 
                    email_message: msg,
                    sent: true
                })
                .then(result => {
                    sendEmail(userName, result.email_to, subject, msg, type)
                    .then(() => {
                        res.status(200).json({ msg: 'We have started sending your email message to your followers'})
                    })
                    .catch(() => {
                        Email.updateOne({ _id: result._id }, { $set: { sent: false }})
                        .then(() => {
                            res.status(400).json({ msg: 'Problem sending your email. We will send resend it later.'})
                        })
                        .catch(err => res.status(400).json({ err: err.message }))
                    }) 
                })
                .catch(err => res.status(400).json({ err: err.message }))

            } else {
                res.status(200).json({ error: 'Could not find followers associated to your account'})
            }
   
        })
        .catch((err) => {
            res.status(400).json({ msg: err.message})
        })
    })
    .catch(err => res.status(400).json({ msg: err.message }))


})



// [] send sms to followers
router.post('/send_follower_sms', ( req, res) => {
    const { msg, payment, userId, eventId, userName, userEmail, type } = req.body.data;

    const transactionRef = payment.response.trxref || '';

    Transactions.create({
        eventId: eventId,
        userId: userId,
        email: payment.email,
        description: 'Sms Messaging',
        totalPrice: payment.amount,
        date: payment.response.timestamp,
        transactionRef: transactionRef,
        currency: payment.currency,
        refunded: false
    })
    .then(() => {
        
        res.status(200).json({ msg: 'We have started sending your sms message to your followers'})
    })
    .catch(err => res.status(400).json({ msg: err.message }))
})



// [] send email to registered user
router.post('/send_registered_email', ( req, res) => {
    const {subject, msg, payment, userId, eventId, userName, userEmail, type } = req.body.data;
        
    const transactionRef = payment.response.trxref || '';

    Transactions.create({
        eventId: eventId,
        userId: userId,
        email: payment.email,
        description: 'Email Messaging',
        totalPrice: payment.amount,
        date: payment.response.timestamp,
        transactionRef: transactionRef,
        currency: payment.currency,
        refunded: false
    })
    .then(() => {
        // Registrations.aggregate([
        //     { $match: { eventId }},
        //     { $group: { "_id": null, emails:{ $addToSet:"$contact" } } },
        //     // { $unwind: "$emails"},
        //     // { $group: { "_id": null, list:{$push:"$emails"} } },
        //     // { $project:{emails:true,_id:false}}
        // ])
        Registrations.find({ eventId, contactType: 'email', active: true })
        .then((list) => {
           console.log(list);
           if ((list.length > 0)){
                Email.create({
                    eventId,
                    userId,
                    type,
                    email_from: `${userEmail} <${type}@prepvent.com>`, 
                    email_to: list.map(x => x.email), 
                    email_subject: subject, 
                    email_reply_to: userEmail, 
                    email_message: msg
                })
                .then(result => {
                    sendEmail(userName, result.email_to, subject, msg, type)
                    .then(() => {
                        res.status(200).json({ msg: 'We have started sending your email message to your registered users'})
                    })
                    .catch((err) => {
                        Email.updateOne({ _id: result._id }, { $set: { sent: false }})
                        .then(() => {
                            res.status(400).json({ msg: 'Problem sending your email. We will send resend it later.'})
                        })
                        .catch(err => res.status(400).json({ err: err.message }))
                    })
                })
                .catch(err => res.status(400).json({ err: err.message }))

           } else {
            res.status(200).json({ error: 'Could not find contact of registered event-goers'})

           }
    
        })
        .catch((err) => {
            res.status(400).json({ msg: err.message})
        })
    })
    .catch(err => res.status(400).json({ msg: err.message }))

})



// [] send sms to registered user
router.post('/send_registered_sms', ( req, res) => {
    const {msg, payment, userId, eventId, userName, userEmail, type } = req.body.data;


    const transactionRef = payment.response.trxref || '';

    Transactions.create({
        eventId: eventId,
        userId: userId,
        email: payment.email,
        description: 'Sms Messaging',
        totalPrice: payment.amount,
        date: payment.response.timestamp,
        transactionRef: transactionRef,
        currency: payment.currency,
        refunded: false
    })
    .then(() => {

        Registrations.aggregate([
            { $match: { eventId, contactType: 'sms', active: true }},
            { $group: { "_id": null, emails:{ $addToSet:"$contact" } } },
            // { $unwind: "$emails"},
            // { $group: { "_id": null, list:{$push:"$emails"} } },
            // { $project:{list:true,_id:false}}
        ]).then((list) => {
            if ((list.length > 0) && (list[0].emails.length > 0)) {

            } else {

            }
            console.log(list[0].emails);
            
        })
        .catch((err) => {
            res.status(400).json({ msg: err.message})
        })
    
        res.status(200).json({ msg: 'We have started sending your sms message to your registered users'})
    })
    .catch(err => res.status(400).json({ msg: err.message }))


})




// [x] get registration list
router.get(`/registered_list/:eventId`, ( req, res) => {
    const { eventId } = req.params;

    var filename   = "Registration_list.csv";
    var dataArray;
    Registrations.find({ eventId, active: true },{
        _id: 1,
        registrationNumber: 1,
        contact: 1,
        ticketName: 1,
        ticketType: 1,
        ticketPrice: 1,
        fullname: 1, 
        salesDate: 1
    }).lean().exec({}, function(err, products) {
        if (err) {
            res.status(400).json({ msg: err.message });
        } else {
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(products);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader("Content-Disposition", 'attachment; filename='+filename);
            res.send(csv)
            
            // console.log(csv);
            // res.status(200).json({ list: csv })
        }
    });

})


// validate ticket
router.get('/validate_ticket/:email/:registrationNumber', (req, res) => {
    const { registrationNumber, email} = req.params;

    Registrations.findOne({ contact: email, registrationNumber }, { eventId: 1, active: 1,  cancellationDate: 1 })
    .populate('eventId', 'name location time published')
    .then(registration => {
        console.log('registration: ', registration);
        
        res.status(200).json({ registration })
    })
    .catch((er) => res.status(401).json({ msg: er.message }))
})

// [] resent ticket
// send ticket by mail
router.post('/resend_ticket', (req, res) => {
    const { email, eventId } = req.body;
    
    Registrations.find({ eventId, contact: email, active: true })
    .then((reg) => {
        console.log(reg);
        
        if (reg.length > 0) {

            Event.findOne({ _id: eventId })
            .then(event => {
                if (event) {
                    // let email_message = resendTicket(event, reg, email)


                    // sendEmail('',email, `${event.name} Ticket(s)`, '', email_message, `Resend_Ticket:${email}-${moment.utc()}`)
                    resendTicket(event, reg, email)
                    .then(() => {
                        res.status(200).json({ msg: 'Ticket has been sent to your mail'})
                    })
                    .catch(() => {
                        res.status(400).json({ msg: 'Problem sending your ticket(s). Please try again later'})
                    })
        
                } else {
                    res.json({ error: 'Event not fount'})
                }
            })
            .catch((err) => {
                res.status(400).json({ msg: err.message})
            })
        } else {
            res.json({ error: 'Ticket registration not found.' }) 
        }
    })
    .catch((er) => {
        res.status(401).json({ msg: er.message })
    })
    // res.status(200).json({ msg: 'Ticket has been sent to your mail'})
});


// [] unsubscribe from organizer
router.put('/organizer_unsubscribe', (req, res) => {
    const { email, userId } = req.body;

    Organizer.findOneAndUpdate({ email, organizerId: userId }, { $set: { subscribe: false } })
    .then((org) => {
        if (org) {
            User.updateOne({ _id: userId }, { $inc: { followerCount: -1 }})
            .then((user) => {
                if (user) {
                     res.status(200).json({ msg: 'You have successfully unsubscribed'})
                } else {
                    res.status(404).json({ msg: 'User not found' })
                }
            })
            .catch((er) => {
                res.status(404).json({ msg: er.message })
            })
        } else {
            res.json({ error: 'Your are not subscribed to the organizer' })
        }
    })
    .catch((er) => {
        res.status(401).json({ msg: er.message })
    })

    // res.status(200).json({ msg: 'You have successfully unsubscribed'})
});


module.exports = router