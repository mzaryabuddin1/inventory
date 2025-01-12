const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    password: String,
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
