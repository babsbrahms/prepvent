var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var ticket = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", index: true },
    type: { type: String },
    name: { type: String },
    qty: { type: Number},
    price: { type: Number},
    salesPrice: { type: Number},
    qtySold: { type: Number},
    iAbsorbCharges: { type: Boolean },
    description: { type: String },
    sku:  { type: String },
    qtyRange: {
        min: { type: Number, min: 1, max: 8},
        max: { type: Number, min: 1, max: 8}
    },
    charges: { type: Number },
    sales: {
        start: { type: Number },
        end: { type: Number },
    },
    notificationChannel: { type: String },
    disabled: { type: Boolean, default: false },
    totalRegistration: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    surplus: { type: Number, default: 0 }
})

const model = mongoose.model('Ticket', ticket);

module.exports = model;