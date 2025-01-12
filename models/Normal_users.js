const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    status: { type: Boolean, default: true },
    otp: { type: String },
    otp_used: { type: Boolean, default: false },
    otp_expire_time: { type: Date },

});

module.exports = mongoose.model('User', userSchema);
