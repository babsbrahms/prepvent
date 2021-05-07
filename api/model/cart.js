var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var cart = new Schema({
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", index: true },
    qty: { type: Number },
    expireIn: { type: Date, default: Date.now, expires: 900 }
})


const model = mongoose.model('Cart', cart);

module.exports = model;