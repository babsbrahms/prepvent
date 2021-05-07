const mongoose = require('mongoose');

let Schema = mongoose.Schema

let organizer = new Schema({
    subscribe: { type: Boolean, default: true },
    email: { type: String, index: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', index: true }
})


const model = mongoose.model('Organizer', organizer);

module.exports = model;