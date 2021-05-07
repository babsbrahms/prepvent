const express = require('express')
const router = express.Router();
const moment = require('moment');
let mySecretKey = (process.env.NODE_ENV || 'development') == 'development'? process.env.PAYSTACK_SECRET_TEST_KEY : PAYSTACK_SECRET_LIVE_KEY;

var paystack = require('paystack')(mySecretKey);

const Registrations = require('../model/registration');
const Event = require('../model/event');
const Ticket = require('../model/ticket');
const Subscriber = require('../model/subscriber');
const StateCount = require('../model/state_count');
const User = require('../model/user');
const Complain = require('../model/complain');
const Cart= require('../model/cart');
const Ticket_sales = require('../model/ticket_sales');
const Promotion = require('../model/promotion')

const refundTicket = require('../utils/helper/refund');

const registrationMail = require('../utils/mail/registration');
const cancellationMail = require('../utils/mail/cancellation');
const updateMail = require('../utils/mail/update');


const isUserAuth = require('../middleware/user');
const findUpdatePromotion = require('../utils/helper/findUpdatePromotion').findUpdatePromotion;
const incrementUpdatePromotion = require('../utils/helper/findUpdatePromotion').incrementUpdatePromotion

const percentageRefund = 0.9;

// [x] search
router.get('/search', ( req, res) =>{
    const search = req.query.q;

    if (search.length === 0) {
        res.status(200).json({ results: [] })
    } else {
        Event.find( { $text: { $search: search } } )
        .then(events => res.status(200).json({ results: events }))
        .catch(err => res.status(400).json({ msg: err.message }))

        // res.status(200).json({ results: events })
    }

})

// [x] create event
router.post('/create', (req, res) => {
    const { data } = req.body;
    let event = { ...data, ticket: [] };
    let ticket = data.ticket;
    
    Event.create(event)
    .then(event => {
        let newTicket = ticket.map(tic => ({
            ...tic,
            eventId: event._id
        }))
        Ticket.insertMany(newTicket)
        .then((tics) => {
            res.status(200).json({ event })
        })
        .catch(err => res.status(404).json({ msg: err.message }))
    })
    .catch(err => res.status(404).json({ msg: err.message }))
    //res.status(200).json({ event: data })
});


// [x] edit event
router.put('/edit', (req, res) => {
    // [] send edit email if location.text, name or time
    const { data } = req.body;
    let event = { ...data, ticket: [] };
    let tickets = data.ticket;
    Event.findById(data._id)
    .then(doc => {
        if (doc) {
            Event.updateOne({ _id: data._id }, event)
            .then((et) => {
                const ticketUpdate = [];
        
                tickets.forEach(ticket => {
                    if (ticket._id) {
                        ticketUpdate.push({
                            updateOne: {
                              "filter" : { _id: ticket._id },
                              "update" : { $set: { 
                                    qty: ticket.qty, 
                                    description: ticket.description, 
                                    disabled: ticket.disabled,
                                    "qtyRange.min": ticket.qtyRange.min,
                                    "qtyRange.max": ticket.qtyRange.max, 
                                    "sales.start": ticket.sales.start,
                                    "sales.end": ticket.sales.end,
        
                                } }
                            }
                        });
                    } else {
                        ticket.eventId = event._id;
                        ticketUpdate.push({
                            insertOne: {
                                "document": ticket
                            }
                        });
                    }
        
                })
        
                Ticket.bulkWrite(ticketUpdate)
                .then(() => {
                    // console.log('DOC: ', doc);
                    // console.log('EVENT: ', event);
                    
                    // check for email update
                    let updates = '';
                    
                    if ((doc.name.trim().toLocaleLowerCase() !== event.name.trim().toLocaleLowerCase()) && (doc.location.text.trim().toLocaleLowerCase() !== event.location.text.trim().toLocaleLowerCase()) && ( moment.utc(doc.time.start).valueOf() !== moment.utc(event.time.start).valueOf() )) {
                        updates = `
                        <li><b>event name changed from ${doc.name} to ${event.name}</b></li>
                        <li><b>location changed from ${doc.location.text} to ${event.location.text}</b></li>
                        <li><b>time changed from ${doc.time.startStr} to ${event.time.startStr}</b></li>
                        `
                    } else if ((doc.name.trim().toLocaleLowerCase() !== event.name.trim().toLocaleLowerCase()) && (doc.location.text.trim().toLocaleLowerCase() !== event.location.text.trim().toLocaleLowerCase())) {
                        updates = `
                        <li><b>event name changed from ${doc.name} to ${event.name}</b></li>
                        <li><b>location changed from ${doc.location.text} to ${event.location.text}</b></li>
                        `
                    } else if ((doc.name.trim().toLocaleLowerCase() !== event.name.trim().toLocaleLowerCase()) && (moment.utc(doc.time.start).valueOf() !== moment.utc(event.time.start).valueOf() )) {
                        updates = `
                        <li><b>event name changed from ${doc.name} to ${event.name}</b></li>
                        <li><b>time changed from ${doc.time.startStr} to ${event.time.startStr}</b></li>
                        `
                    } else if ((doc.location.text.trim().toLocaleLowerCase() !== event.location.text.trim().toLocaleLowerCase()) && (moment.utc(doc.time.start).valueOf() !== moment.utc(event.time.start).valueOf())) {
                        updates = `
                        <li><b>event location changed from ${doc.location.text} to ${event.location.text}</b></li>
                        <li><b>time changed from ${doc.time.startStr} to ${event.time.startStr}</b></li>
                        `
                    } else if ((doc.name.trim().toLocaleLowerCase() !== event.name.trim().toLocaleLowerCase())) {
                        updates = `
                        <li><b>event name changed from ${doc.name} to ${event.name}</b></li>
                        `
                    } else if ((doc.location.text.trim().toLocaleLowerCase() !== event.location.text.trim().toLocaleLowerCase())) {
                        updates = `
                        <li><b>event location changed from ${doc.location.text} to ${event.location.text}</b></li>
                        `
                    } else if ((moment.utc(doc.time.start).valueOf() !== moment.utc(event.time.start).valueOf())) {
                        updates = `
                        <li><b>event start time changed from ${doc.time.startStr} to ${event.time.startStr}</b></li>
                        `
                    }

                    if (updates.length > 0) {

                        Promotion.updateMany({ eventId: event._id }, 
                            { $set: {
                                "data.name": event.name, 
                                "data.time": event.time,
                                "data.location": event.location,
                                "data.poster": event.poster,
                                "data.published": event.published 
                            }
                        }).then(() => {

                            Registrations.aggregate([
                                { $match: { eventId: doc._id }},
                                { $group: { "_id": null, emails:{ $addToSet:"$contact" } } },
                            ]).then((list) => {
                               // console.log('LISTS: ', list);
                                
                                if ((list.length > 0) && (list[0].emails.length > 0)) {
                                    console.log('id: ', doc._id);
                                    
                                    findUpdatePromotion(doc.location.state, doc._id)
                                    .then(promotions => {
                                        console.log('PROMOTION: ',promotions.length);
                                        updateMail(promotions, `Other events you might be intrested in`,updates, doc.name, doc._id, list[0].emails)
                                        .then(() => {
                                            console.log('list: ', list[0].emails.length);
                                            console.log(updates);
                                            
                                            if (promotions.length > 0) {
                                                incrementUpdatePromotion(promotions, list[0].emails.length)
                                                .then((result) => {
                                                    console.log('inc result:', result);
                                                    
                                                    res.status(200).json({ event: event })
                                                })                                 
                                                .catch((err) => {
                                                    console.log('inclement err: ', err);
                                                    
                                                    res.status(400).json({ msg: err.message})
                                                })
                                            } else {
                                                res.status(200).json({ event: event })
                                            }
                                            
                                        })
                                        .catch(() => {
                                            res.status(400).json({ msg: "Event updated. But could'nt send update email"})
                                        })
                                    })
                                    .catch((err) => {
                                        console.log('find err: ', err);
                                        res.status(401).json({ msg: err.message})
                                    })
                                } else {
                                    res.status(200).json({ event: event })
                                }
    
                            })
                            .catch((err) => {
                                res.status(400).json({ msg: err.message})
                            })
                        })
                        .catch((err) => {
                            res.status(400).json({ msg: err.message})
                        })
                        
                    } else {
                        res.status(200).json({ event: event })
                    }

                } )
                .catch(err => res.status(400).json({ msg: err.message }))
            })
        } else {
            res.json({ error: 'Event not found' })  
        }
    })
    .catch(err => res.status(400).json({ msg: err.message }))

   // res.json({ event: event })
});



// [x] get event for event-goers no ticket
router.get(`/:id`, (req, res) => {
    const { id } = req.params;

    Event.findOne({ _id: id })
    .then(event => {
        if (event) {
            res.status(200).json({ event })
        } else {
            res.json({ error: 'Event not found' })
        }
    })
    .catch(err => res.status(400).json({ msg: err.message }))
}) 

// [x] get active events for profile page
router.get('/my_active_event/:userId', (req, res) => {
    const { userId } = req.params;

    Event.find({ "organizer.userId": userId, deleted: false, published: true, 'time.end': {"$gt": new Date(moment.utc().valueOf()) } }).sort({ 'time.start': 1 })
    .then(events => res.status(200).json({ events }))
    .catch(err => res.status(400).json({ msg: err.message }))
    // res.json({ events: events })
})

// [x] get inactive events for profile page
router.get('/my_inactive_event/:userId', (req, res) => {
    const { userId } = req.params;

    Event.find({ "organizer.userId": userId, deleted: false,  $or: [{ published: false }, { 'time.end': {"$lt": new Date(moment.utc().valueOf()) } }] }).sort({ 'time.start': 1 })
    .then(events => res.status(200).json({ events }))
    .catch(err => res.status(400).json({ msg: err.message }))
    // res.json({ events: events })
})

// [x]  all event for a state in home page
router.get(`/all_event/:country/:state`, (req, res) => {
    const { country, state } = req.params;

    // 
    Event.find({ "location.country": country, "location.state": state, published: true, 'time.start': {"$gt": new Date(moment.utc().valueOf()) } }).sort({ 'time.start': 1 })
    .then(events => res.status(200).json({ events }))
    .catch(err => res.status(400).json({ msg: err.message }))

    // res.json({ events: events })
})


// [x] get one event (mine) that is not deleted  and ticket (all)
router.get(`/my_event_and_ticket/:id`, (req, res) => {
    const { id } = req.params;

    Event.findOne({ _id: id, deleted: false })
    .then(event => {
        if (event) {
            Ticket.find({ eventId: id }, (err, ticket) => {
                if (err) {
                    res.status(404).json({ msg: err.message })  
                } else {
                    event.ticket = ticket;
                    res.status(200).json({ event })
                }
            })
        } else {
            res.json({ error: 'Event not found' })
        }

        
    })
    .catch(err => res.status(400).json({ msg: err.message }))

  // res.json({ event: eventAndTicket })
}) 


//  [x] ticket with no disable ticket
router.get(`/event_and_ticket/:id`, (req, res) => {
        const { id } = req.params;

        Event.findOne({ _id: id })
        .then(event => {
            if (event) {
                Ticket.find({ eventId: id, disabled: false }, (err, ticket) => {
                    if (err) {
                        res.status(404).json({ msg: err.message })  
                    } else {
                        event.ticket = ticket;
                        res.status(200).json({ event })
                    }
                })
            } else {
                res.json({ error: 'Event not found' })
            }  
        })
        .catch(err => res.status(400).json({ msg: err.message }))

       // res.json({ event: eventAndTicket })
}) 


// [x]  ticket with no disable ticket
router.get(`/ticket/:eventId`, (req, res) => {
    const { eventId } = req.params;

    Ticket.find({ eventId: eventId, disabled: false })
    .then(ticket => res.status(200).json({ ticket }))
    .catch(err => res.status(400).json({ msg: err.message }))

    //res.json({ ticket })
})

// [x]  all ticket enable and disable
router.get(`/my_ticket/:eventId`, (req, res) => {
    const { eventId } = req.params;

    Ticket.find({ eventId: eventId })
    .then(ticket => res.status(200).json({ ticket }))
    .catch(err => res.status(400).json({ msg: err.message }))
    //res.json({ ticket })
})

// // [x]  disable a ticket
// router.put(`/disable_ticket/`, (req, res) => {
//     const { id } = req.body;
//     Ticket.findOneAndUpdate({ _id: id }, { $set: { disabled: true }}, {new: true})
//     .then(ticket => {
//         if (ticket) {
//             res.status(200).json({ ticket })
//         } else {
//             res.status(404).json({ msg: err.message })
//         }
//     })
//     .catch(err => res.status(400).json({ msg: err.message }))

//    // res.json({ ticket: ticket[0] })
// })

// // [x]  enable a ticket
// router.put(`/enable_ticket/`, (req, res) => {
//     const { id } = req.body;

//     Ticket.findOneAndUpdate({ _id: id }, { $set: { disabled: false }}, {new: true})
//     .then(ticket => {
//         if (ticket) {
//             res.status(200).json({ ticket })
//         } else {
//             res.status(404).json({ msg: err.message })
//         }
//     })
//     .catch(err => res.status(404).json({ msg: err.message }))

//     //res.json({ ticket: ticket[0] })
// })

// [x]  cancel a ticket: If an event is cancelled, it loses all the tickets registered to the event'
router.put(`/cancel_event/`, (req, res) => {
    // [] send cancellation email
    const { id } = req.body;

    Event.findOneAndUpdate({ _id: id }, { $set: { deleted: false, published: false }}, {new: true})
    .then(event => {
        Promotion.updateMany({ eventId: event._id }, 
            { $set: { 
                "data.name": event.name, 
                "data.time": event.time,
                "data.location": event.location,
                "data.poster": event.poster,
                "data.published": event.published 
            }
        }).then(() => {

            Registrations.aggregate([
                { $match: { eventId: event._id }},
                { $group: { "_id": null, emails:{ $addToSet:"$contact" } } },
                // { $unwind: "$emails"},
                // { $group: { "_id": null, list:{$push:"$emails"} } },
                // { $project:{emails:true,_id:false}}
            ]).then((list) => {
               console.log('LISTS: ', list);

                if ((list.length > 0) && (list[0].emails.length > 0)) {

                    findUpdatePromotion(event.location.state, event._id)
                    .then(promotions => {
                        console.log('PROMOTION: ',promotions);
    
                        cancellationMail(promotions, `Other events you might be intrested in`, event.name, event._id, list[0].emails)
                        .then(() => {
                            if (promotions.length > 0) {
                                incrementUpdatePromotion(promotions, list[0].emails.length)
                                .then((te) => {
                                    console.log('incl');
                                    
                                    res.status(200).json({ event: event })
                                })                                 
                                .catch((err) => {
                                    res.status(400).json({ msg: err.message})
                                })
                            } else {
                                res.status(200).json({ event: event })
                            }
                        })
                        .catch(() => {
                            res.status(400).json({ msg: "Event successfully cancelled. But could not send cancellation email. Please send it manually in your dashboard."})
                        })
                    })
                    .catch((err) => {
                        res.status(400).json({ msg: err.message})
                    })
                } else {
                    res.status(200).json({ event: event })
                }
            })
            .catch((err) => {
                res.status(400).json({ msg: err.message})
            })
        })
        .catch((err) => {
            res.status(400).json({ msg: err.message})
        })

    })
    .catch(err => res.status(400).json({ msg: err.message }))

    //res.json({ event: event })
})


// [X] publish a ticket: Publishing a cancelled event does not reassign lost tickets, it just recreates the event. == new _id
// router.put(`/publish_event/`, (req, res) => {
//     const { id } = req.body;
//     Event.findOne({ _id: id })
//     .then(event => {
//         if (event && !event.published) {
//            let newEvent = { ...event._doc };

//             delete newEvent._id;
//             newEvent.published = true;
//             newEvent.deleted = false;
//             newEvent.payed = false;
            
    
//             Event.create(newEvent)
//             .then(ev => res.status(200).json({ event: ev }))
//             .catch(err => res.status(400).json({ msg: err.message }))
//         } else {
//             res.json({ error: 'Event is already published' })
//         }

//     })
//     .catch(err => res.status(400).json({ msg: err.message }))
//     // res.json({ event: event })
    
// })

// [x] DELETE A EVENT == published: false, delete: false: return event and ticket
router.put(`/delete_event/`, (req, res) => {
    const { id } = req.body;

    Event.findByIdAndUpdate(id, { $set: { deleted: true, published: false }}, {new: true})
    .then(event => res.status(200).json({ event }))
    .catch(err => res.status(404).json({ msg: err.message }))

   // res.json({ event: event })
})


// [x]  verify ticket
router.get('/verify_ticket/:ticketId/:qty/:startTime', (req, res) => {
    const { ticketId, qty, startTime } = req.params;
    // Check list
    // [] Ticket is not disabled
    // [] Ticket qty is still available
    // [] Not out of sales period

    Ticket.findOne({ _id: ticketId })
    .populate('eventId')
    .then(ticket =>{
        if (ticket && ticket.eventId && ticket.eventId.published)  {
            Cart.create({
                ticketId: ticketId,
                qty: qty,
            }).then((cart) => {
                Cart.find({ ticketId: ticketId }, { qty: 1, _id: 0 })
                .then((ag) => {
                    let reserves = ag.reduce((p, c) => p + c.qty, 0);         
                    
                    let timeRemaining = moment.utc(ticket.eventId.time.start).valueOf() - ticket.sales.end - moment.utc().valueOf();
                    let qtyRemaining = ticket.qty - ticket.qtySold - reserves;
        
                    //300000ms = 10min
                    if (timeRemaining < 600000) {
                        // not out of sales period
                        res.status(200).json({ error: 'The ticket sales period has ended' })
                    } else if (qty > qtyRemaining) {
                        // qty avaiable is greater than or equal the qty you are buying
                        res.status(200).json({ error: `The ticket quantity you are buying is greater than the quanity available. There are only ${(qtyRemaining <= 0)? '0': qtyRemaining} ticket left.` })
                    } else if (ticket.disabled) {
                        // ticket is disabled
                        res.status(200).json({ error: 'The ticket has been disable for sale by the event organizer' })
                    } else {
                        res.status(200).json({ cartId: cart._id })
                    }
                    
                })
                .catch(err => res.status(404).json({ msg: err.message }))
            })
            .catch(err => res.status(404).json({ msg: err.message })) 
        } else {
            res.json({ error: 'This event has been cancelled'})
        }
    })
    .catch(err => res.status(404).json({ msg: err.message }))

})


// [] verify ticket using the api
// MAIL: REGISTRATION AND REFUND
router.post(`/register_ticket/`, (req, res) => {  
    const { tickets, buyer, pid } = req.body;
    const ticketId = tickets[0].ticketId;
    const eventId = tickets[0].eventId;
    const ticketName = tickets[0].ticketName;

    /////CHECK////
    // [x] verify purchase
    // [-] sales period
    // [-] is ticket is free or sale Channel === 'At event location'
    // [x] Free Ticket
    // [-] check if ticket is available|| no === refund and send message(model) || yes === continue

    /////EXECUTE////
    // [x] save transaction
    // [x] increment ticket sales
    // [x] register sales
    // [x] subscribe to prepvent
    // [x] send email
    // [x] cancel cart

    // Require the library

// Download library from https://github.com/kehers/paystack
    Event.findOne({ _id: eventId })
    .then(event => {
        if (event) {
            Ticket.findOne({ _id: ticketId })
            .then(ticket => {
                if (buyer.amount === 0) {     
                    buyTicket(req, res, buyer.amount)
                } else if (!ticket) {
                    res.json({ error: 'Ticket not found' })
                } else { 
                    const transactionRef = buyer.response.trxref;

                    paystack.transaction.verify(transactionRef)
                    .then(body => {                        
                        if ((body.data.amount != (buyer.amount*100)) || (body.data.currency != buyer.currency.abbr)) {
                            res.json({ error:  `You payed ${body.data.amount/100}${body.data.currency} instead of ${buyer.amount}${buyer.currency.abbr.toLocaleLowerCase()}` })
                        } else if (body.data.status === 'success') {                         
                            
                            Ticket_sales.create({
                                eventId,
                                ticketId: ticketId,
                                email: buyer.email,
                                description: `Name:${tickets[0].ticketName} // Id: ${ticketId} // ticket purchase`,
                                qty: tickets.length,
                                tickets: tickets.map((tics, index) => ({ 
                                    ticketPrice:tics.ticketPrice,
                                    batchIndex: index,
                                    refunded: false,
                                    refunds: 0
                                })),
                                totalPrice: buyer.amount,
                                transactionRef: transactionRef,
                                currency: buyer.currency,
                                cancellationRefund: false ,
                                amountRefunded: 0,
                                revenue: buyer.amount,
                                surplus: 0,
                                cartId: buyer.cartId
                            })
                            .then(() => {
                                buyTicket(req, res, buyer.amount)
                            })
                            .catch((er) => {
                                res.status(401).json({ msg: er.message })
                            })
                        } else {
                            res.json({ error:  `Problem verify your transaction. Contact us the complaint form below. Provide the transaction reference sent to your mail and the email address it was sent to. Thank you.` })
                        }
                    })
                    .catch((error) => {
                        
                        res.status(400).json({ msg:  error.message})
                    })    
                }
    
                function buyTicket (req, res, amount) {
                    //increment ticket sales
                    Ticket.findOneAndUpdate({ _id: ticketId }, { $inc: { qtySold: tickets.length, totalRegistration: tickets.length, revenue: amount }}, { new: true })
                    .then((tic) => {
                        console.log(`${tic.sku}${tic.totalRegistration}`);
                        
                        // register sales
                        const ticketRegistration = tickets.map((reg, index) => ({
                            batchIndex: index,
                            ticketId: reg.ticketId,
                            eventId: reg.eventId,
                            registrationNumber: `${tic.sku}${tic.totalRegistration - index}`,
                            contactType: reg.contactType,
                            contact: reg.contact,
                            ticketName: reg.ticketName,
                            ticketType: reg.ticketType,
                            ticketPrice: reg.ticketPrice,
                            currency: buyer.currency,
                            fullname: reg.fullname, 
                            active: true ,
                            salesDate: moment.utc().valueOf(),
                            // cancellationDate: { type: Date },
                            refunded: false,
                            cartId: buyer.cartId,
                            promotionId: pid
                        }))
    
                        Registrations.insertMany(ticketRegistration)
                        .then((savedRegistration) => {
                           // console.log('savedReg: ', savedRegistration);
                            
                            //Delete Cart
                            Cart.findByIdAndRemove(buyer.cartId)
                            .then(() => {
                                // subscribe to prepvent and send mail
                                if (buyer.subscribe) {
                                    Subscriber.updateOne(
                                        { $and: [{state: event.location.state}, {email:  buyer.email}, {country: event.location.country}] },
                                        { $set: { subscribe: true, email:  buyer.email, state: event.location.state, country: event.location.country  } },
                                        { upsert: true })
                                        .then((up) => {
                                          //  console.log('UPSERTED : ',up);
                                           if (up.upserted|| up.nModified === 1) {
                                                StateCount.updateOne(
                                                    { state: event.location.state, country: event.location.country }, 
                                                    { $inc: { count: 1 }}, 
                                                    { upsert: true }
                                                ).then(() => {
                                                    // send email
                                                    if (pid) {
                                                        addPromotionSales(req, res, event, savedRegistration)
                                                    } else {
                                                        sendRegistrationMail(req, res, event, savedRegistration)
                                                    }
                                                })
                                                .catch((er) => {
                                                    res.status(401).json({ msg: er.message })
                                                })
                                            } else {
                                                if (pid) {
                                                    addPromotionSales(req, res, event, savedRegistration)
                                                } else {
                                                    sendRegistrationMail(req, res, event, savedRegistration)
                                                }
                                            }

    
                                    })
                                    .catch((errs) => {
                                        res.status(401).json({ msg: 'problem subscribing to prepvent' })
                                    })
                                } else {
                                    if (pid) {
                                        addPromotionSales(req, res, event, savedRegistration)
                                    } else {
                                        sendRegistrationMail(req, res, event, savedRegistration)
                                    }
                                }
    
                                function sendRegistrationMail(req, res, event, savedRegistration) {
                                    //let time = moment.utc();

                                    let mailList = savedRegistration.map((tickReg ) => registrationMail(event, tickReg));
                                    
                                    console.log('mailist: ', mailList);
                                           
                                    Promise.all(mailList)
                                    .then(() => {
                                        // respond
                                        res.status(200).json({ msg: 'Congratulations, your ticket has been successfully purchased!'})
                                    })
                                    .catch(() => {
                                        res.status(400).json({ msg: "Your ticket has been successfully purchased!. But could'nt send the registration email. Use `resnd ticket' button in ticket segment to resolve the issue."})
                                    })                                    
                                }

                                function addPromotionSales(req, res, event, savedRegistration) {
 
                                    Promotion.updateOne({ _id: pid }, { $inc: { 'analytics.sales': tickets.length, 'analytics.salesRevenue': buyer.amount, [`analytics.ticket.${ticketName}.qtySold`]: tickets.length, [`analytics.ticket.${ticketName}.revenue`]: buyer.amount }})
                                    .then((result) => {
                                        console.log('result: ', result);
                                        
                                        sendRegistrationMail(req, res, event, savedRegistration)
                                    })
                                    .catch(err => res.status(400).json({ msg: err.message }))
                                }
                            })
                            .catch((er) => {
                                res.status(401).json({ msg: er.message })
                            })
    
    
                        })
                        .catch((er) => {
                            res.status(401).json({ msg: er.message })
                        })
                        
                    })
                    .catch(err => res.status(401).json({ msg: err.message }))
                }
    
            })
        } else {
            res.json({ error: 'Event not found' })
        }
    })
    // res.json({ msg: 'Congratulations, your ticket has been successfully purchased!'})
})


//  [x]  cancel ticket
router.put('/cancel_ticket', (req, res) => {
    const { email, registrationNumber, eventId } = req.body;
    
    Registrations.findOne({
        registrationNumber,
        eventId,
        contact: email,
        active: true
    }).then(reg => {
        if (reg) {
            // console.log('Reg: ', reg);
            if (reg.ticketPrice === 0) {
                // update registartion
                cancelTicket(req, res, reg, 0, 0)
            } else {                

                //REFUND 
                // check list
                //[x] event is stil active or not cancelled or payed
                //[x] ticket is not refunded already
                //[x] if event is refundable
                //[x] refund duration
                //[] email and transactionRef
                //[x] 0.9% of amount
                //[] consider buy group ticket with one email(one transRef)
                Event.findOne({ _id: eventId })
                .then(event => {
                        
                    if (event.published === false) {
                        res.json({ error: 'The event has been cancelled by the organizer. Hence you will get your ticket refund as a group refund.' })
                    } else if (event.refundPolicy.value === 'NOT') {
                        // refundable
                        res.json({ error: 'This ticket is not refundable' })
                    } else if ((event.refundPolicy.value !== 'NOT') && (moment.utc().valueOf() > (moment.utc(event.time.start).valueOf() - event.refundPolicy.value))) {
                        // refund duration
                        res.json({ error: 'Ticket refund period is over' })
                    } else if (reg.refunded) {
                        res.json({ error: 'The ticket has already been refunded' })
                    } else { 

                        // refund ticket
                        Ticket_sales.findOne({ ticketId: reg.ticketId, cartId: reg.cartId })
                        .then((sales) => {
                            if (sales) {

                                // console.log('sales', sales);
                                // [x] refund ticket
                                // [x] update registartion
                                // [x] decrement ticket

                                let amount = percentageRefund * reg.ticketPrice;
                                let surplus = (1-percentageRefund)* reg.ticketPrice;


                                refundTicket(sales.transactionRef, amount, `Refund for ticket cancelation: ${reg.ticketId}`, `Ticket refund cancelled by buyer: ${reg.ticketId}`, event.currency)
                                .then(refund => {
                                    if (refund.status) {
                                        // update sales
                                        sales.updateOne({ $set: { [`tickets.${reg.batchIndex}.refunded`]: true, [`tickets.${reg.batchIndex}.refunds`]: amount  }, $inc: { amountRefunded: amount, revenue: -reg.ticketPrice, surplus: surplus }})
                                        .then(( ) => {
                                            // update registartion
                                            cancelTicket(req, res, reg, reg.ticketPrice, surplus)
                                        })
                                        .catch((err) => {
                                            res.status(400).json({ msg: err.message })
                                        })

                                    } else {
                                        res.json({ error: refund.message })
                                    }
                                })
                                .catch((err) => {
                                    res.status(400).json({ msg: err.message })
                                })

                            } else {
                                res.json({ error: 'Ticket not found' })
                            }  
                        })                
                        .catch(error => {
                            res.status(400).json({ msg: error })
                        })

                    }
                })
                .catch(error => {
                    res.status(400).json({ msg: error })
                })
    
            }

            function cancelTicket (req, res, reg, amount, surplus) {

                // update registartion
                reg.updateOne({ $set: {refunded: true, active: false, cancellationDate: moment.utc().valueOf() }})
                .then(() => {
                    // decrement ticket
                    
                    Ticket.findOneAndUpdate({ _id: reg.ticketId }, { $inc: { qtySold: -1, revenue: -amount, surplus: surplus  }})
                    .then(() => res.status(200).json({ msg: 'Your ticket is successfully cancelled!' }))
                    .catch(er => res.status(400).json({ msg: er.message }))
                })
                .catch(err => {
                    res.status(400).json({ msg: err.message })
                })
            }


        } else {
            res.json({ error: 'Ticket not found. Check the information you provided.' })
        }
    })
    .catch(error => {
        res.status(400).json({ msg: error.message })
    })

   // res.status(200).json({ msg: 'Your ticket has been cancelled!' })
});



// [-]  get payed for an event
router.post(`/request_for_payment/`, ( req, res ) => {
    const { eventId, userId, ticketIds } = req.body;

    res.json({ msg: 'You will get paid within 2-7 working days.' })
})

// [x]  get count of organizer follower using email (use user followerCount)
router.get(`/organizer_follower_email_count/:userId`, ( req, res) => {
    const { userId  } = req.params;

    User.findById(userId)
    .then((user) => {
        if (user) {
            res.status(200).json({ count: user.followerCount || 0 })
        } else {
            res.json({ error:  'Organizer not found' })
        }
    })
    .catch((er) => {
        res.status(404).json({ msg: er.message })
    })

   // res.json({ count: user.followerCount })
})



// [x] get count of organizer follower using sms (use user followerCount)
router.get(`/organizer_follower_sms_count/:userId`, ( req, res) => {
    const { userId } = req.params;
    res.status(200).json({ count: 0 })
    //res.status(200).json({ count: 1000 })
})

// [x]  get count of registered users using email (use tickets, add up qtySold)
router.get(`/registered_email_count/:eventId`, ( req, res) => {
    const { eventId } = req.params;

    Ticket.find({ eventId })
    .then(tickets => {
        let count  = tickets.reduce((prev, curr) => (prev + curr.qtySold),0)
        res.status(200).json({ count })
    })
    .catch((er) => {
        res.status(401).json({ msg: er.message })
    })
   // res.json({ count: 1000 })
})



// [x]  get count of registered users using sms (use tickets, add up qtySold)
router.get(`/registered_sms_count/:eventId`, ( req, res) => {
    const { eventId } = req.params;

    res.status(200).json({ count: 0 })

    // res.status(200).json({ count: 1000 })
})


// [x] send complain or about an event 
router.post('/send_complain', (req, res) => {
    const { name, email, reason, message, sendCopy, eventId, eventName } = req.body.data;
    
    // eventId: id || null
    // eventName: name || null
    Complain.create({
        name, 
        email, 
        reason,
        message,
        eventId, 
        eventName, 
    })
    .then(() => {

        res.status(200).json({ msg: 'We have recieved your complaint. We will get back to you soon!'})    
        
    })
    .catch((er) => {
        res.status(401).json({ msg: er.message })
    })

    // res.status(200).json({ msg: 'We have recieved your message. We will get back to you soon!'})
})




module.exports = router