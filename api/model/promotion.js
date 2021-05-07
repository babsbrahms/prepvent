var mongoose = require('mongoose')

let Schema = mongoose.Schema
var promotion = new Schema({
    type: { type: String, index: true },
    registartionDate: { type: Date },
    // clicks: { type: Number },
    // cost: { type: Number },
    currency: {
        name: { type: String },
        abbr: { type: String }
    },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", index: true  },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    detail:  { 
        state: { type: String, index: true }, 
        done: { type: Boolean },
        cost: { type: Number },
        postCount: { type: Number },
        postSent: { type: Number },
        costPerMessage: { type: Number },
        costPerDay: { type: Number },
        duration: { type: Object },
        media: { type: String },
        costPerPost: { type: Number },
        postDate: { type: String }
    },
    data:  { 
        name: { type: String } ,
        time: {
            start: { type: Date },
            end: { type: Date },
            startStr: { type: String},
            endStr: { type: String},
            localOffset: { type: String }
        },
        location: {
            text: { type: String} ,
            street: { type: String} ,
            city: { type: String} ,
            state: { type: String, index: true } ,
            country: { type: String },
            position: { 
                lat: { type: Number }, 
                lng: { type: Number } 
            }
        },
        poster: { type: String },
        published: { type: Boolean }
    },
    analytics: {
        clicks: { type: Number },
        sales: {type: Number },
        salesRevenue: { type: Number },
        ticket: { type: Schema.Types.Mixed } // 'ticketName': { qtySold: '', revenue: '' }
    }
})

const model = mongoose.model('Promotion', promotion);

module.exports = model;