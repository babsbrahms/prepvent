const mongoose = require('mongoose');

let Schema = mongoose.Schema

let contact = new Schema({
    name: { type: String }, 
    type: { type: String }, 
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    time: { type: String },
    location: {
        text: { type: String} ,
        street: { type: String} ,
        city: { type: String} ,
        state: { type: String, index: true } ,
        country: { type: String, index: true },
    },
    website: { type: String },
    map: { type: String},
    image: { type: String },
    google: { type: String },
    youtube: { type: String }, 
    wikipedia: { type: String }
}, { timestamps: true })


const model = mongoose.model('Contact', contact);

module.exports = model;