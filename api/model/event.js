var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var event = new Schema({
    name: { type: String, index: true } ,
    time: {
        start: { type: Date },
        end: { type: Date },
        startStr: { type: String},
        endStr: { type: String},
        localOffset: { type: String }
    },
    location: {
        text: { type: String} ,
        street: { type: String} ,
        city: { type: String} ,
        state: { type: String, index: true } ,
        country: { type: String, index: true },
        isoCode: { type: String },
        position: { 
            lat: { type: Number }, 
            lng: { type: Number } 
        }
    },
    category: { type: String, index: true} ,
    eventType: { type: String} ,
    poster: { type: String} ,
    summary: { type: String} ,
    tag: { type: String} ,
    free: { type: Boolean } ,
    organizer: {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        name: { type: String},
        phoneNumber: { type: String},
        email: { type: String }
    },
    ticket: [],
    ticketChargeRate: { type: Number },
    refundPolicy: {
        value: { type: String }, 
        text: { type: String }
    },
    currency: {
        name: '',
        abbr: ''
    },
    invitationLetter: { type: String },
    promoText: { type: String },
    published: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    payed: { type: Boolean, default: false },

}, { timestamps: true })

event.index({ name: 'text' });

const model = mongoose.model('Event', event);

module.exports = model;