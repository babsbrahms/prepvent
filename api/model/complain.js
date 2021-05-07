const mongoose = require('mongoose');

let Schema = mongoose.Schema

let complain = new Schema({
    name: { type: String }, 
    email: { type: String }, 
    reason: { type: String },
    message: { type: String },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event'}, 
    eventName: { type: String },
    resolved: { type: Boolean, default: false }, 
}, { timestamps: true })


const model = mongoose.model('Complain', complain);

module.exports = model;