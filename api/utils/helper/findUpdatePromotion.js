const moment = require('moment');
const Promotion = require('../../model/promotion');
// et time = ;
const findUpdatePromotion = (state, eventId) => Promotion.find(
    { eventId : {$ne : eventId}, type: 'event update', 'data.published': true, 'detail.state': state, 'data.time.end': {"$gt": new Date(moment.utc().valueOf()) }, $expr: { $lt: ["detail.postCount", "detail.postSent"] }})

const incrementUpdatePromotion = (promotions, sentCount) => Promotion.updateMany(
        { _id: { $in: promotions.map(x => x._id) } }, 
        { '$inc': { 'detail.postSent': sentCount }}
)

//     { $inc: { "detail.postSent": sentCount }}, 
module.exports = { findUpdatePromotion, incrementUpdatePromotion };

