var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')

var Schema = mongoose.Schema;

var user = new Schema({
    firebaseId: { type: String, index: true },
    photoUrl: { type: String },
    name: { type: String },
    email: { type: String, index: true, unique: true },
    phoneNumber: { type: String },
    description: { type: String },
    followerCount: { type: Number, default: 0},
    payment: {
        bankName: { type: String },
        accountNumber: { type: Number },
        accountName: { type: String }
    },
    token: { type: String }
}, { timestamps: true })

user.methods.updatePayment = (val) => {
    this.payment = val
}

user.methods.getToken = () => {
    this.token = this.generateToken()
}

user.methods.generateToken = () => {
    return jwt.sign({
        firebaseId: this.firebaseId,
        photoUrl: this.photoUrl,
        name: this.name,
        email: this.email,
        phoneNumber: this.phoneNumber,
        description: this.description,
        followerCount: this.followerCount,
        payment: this.payment,
    }, process.env.TOKEN_KEY)
}


user.methods.addFollower = () => {
    this.followerCount += 1
}

user.methods.reduceFollower = () => {
    this.followerCount -= 1
}

const model = mongoose.model('User', user);

module.exports = model;