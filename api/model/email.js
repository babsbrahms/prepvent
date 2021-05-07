const mongoose = require('mongoose');

let Schema = mongoose.Schema

let email = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: "Event", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String },
    email_from: { type: String },
    email_to: { type: Array },
    email_subject: { type: String },
    email_reply_to: { type: String },
    email_message: { type: String },
    sent: { type: Boolean }
}, { timestamps: true })


const model = mongoose.model('Email', email);

module.exports = model;