var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var state_count = new Schema({
    state: { type: String, index: true },
    country: { type: String, index: true },
    count: { type: Number, default: 0}
})

const model = mongoose.model('State_count', state_count);

module.exports = model;