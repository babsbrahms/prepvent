const mongoose = require('mongoose');

let Schema = mongoose.Schema

let contact = new Schema({
    name: { type: String }, 
    email: { type: String }, 
    reason: { type: String },
    message: { type: String },
    sendCopy: { type: Boolean }, 
    resolved: { type: Boolean, default: false }, 
    byPrepvent: { type: Boolean, default: false },
}, { timestamps: true })


const model = mongoose.model('Contact', contact);

module.exports = model;