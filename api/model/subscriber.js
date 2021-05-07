const mongoose = require('mongoose');

let Schema = mongoose.Schema

let subscriber = new Schema({
    subscribe: { type: Boolean, default: true },
    email: { type: String, index: true },
    state: { type: String, index: true },
    country: { type: String },
})


const model = mongoose.model('Subscriber', subscriber);

module.exports = model;