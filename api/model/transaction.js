var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var transaction = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: "Event", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
    description: { type: String },
    totalPrice: { type: Number},
    date: { type: Date },
    transactionRef: { type: String, index: true },
    currency: {
        name: '',
        abbr: ''
    },
    refunded: { type: Boolean, default: false },
    amountRefunded: { type: Number },
}, { timestamps: true })

const model = mongoose.model('Transaction', transaction);

module.exports = model;