var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var country = new Schema({
    name: { type: String, unique: true, index: true },
    states: [],
    mecca: { type: String },
    isoCode: { type: String },
    currency: {
        name: { type: String },
        abbr: { type: String },
    },
    localOffset: { type: String },
    ticketChargeRate: 0,
    costPerEmail: 0,
    costPerSms: 0,
    mailingListCostPerMail: 0,
    eventUpdateCostPerMail: 0,
    costPerFacebookPost: 0, 
    costPerIntagramPost: 0,
    costPerTwitterPost: 0,
    costPerWhatsappPost: 0,
    featuredEventCostPerDay: 0
})

const model = mongoose.model('Country', country);

module.exports = model;