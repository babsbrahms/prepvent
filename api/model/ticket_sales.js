var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var ticket_sales = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: "Event", index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", index: true },
    email: { type: String },
    description: { type: String },
    qty: { type: Number},
    tickets: [{
        ticketPrice: { type: Number },
        batchIndex: { type: Number },
        refunded: { type: Boolean },
        refunds: { type: Number },
    }],
    totalPrice: { type: Number},
    date: { type: Date, default: Date.now },
    transactionRef: { type: String, index: true },
    currency: {
        name: '',
        abbr: ''
    },
    cancellationRefund: { type: Boolean, default: false },
    amountRefunded: { type: Number },
    revenue: { type: Number },
    surplus: { type: Number },
    cartId: { type: Schema.Types.ObjectId }
}, { timestamps: true })

const model = mongoose.model('Ticket_sales', ticket_sales);

module.exports = model;