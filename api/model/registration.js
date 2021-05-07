const mongoose = require('mongoose');

let Schema = mongoose.Schema

let registration = new Schema({
    batchIndex: { type: Number },
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", index: true },
    registrationNumber: { type: String },
    contactType: { type: String },
    contact: { type: String },
    ticketName: { type: String },
    ticketType: { type: String },
    ticketPrice: { type: Number },
    currency: {
        name: '',
        abbr: ''
    },
    fullname: { type: String }, 
    active: { type: Boolean, default: true },
    salesDate: { type: Date },
    cancellationDate: { type: Date },
    refunded: { type: Boolean, default: false },
    cartId: { type: Schema.Types.ObjectId },
    promotionId: { type: String }
})


const model = mongoose.model('Registration', registration);

module.exports = model;