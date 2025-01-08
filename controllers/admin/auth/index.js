const Joi = require('joi');
const jwt = require('jsonwebtoken');

const authCrtl = {
    register: async (req, res) => {
        try {
            const schema = Joi.object({
                first_name: Joi.string().min(2).max(50).required(),
                last_name: Joi.string().min(2).max(50).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*]).*$')).required()
            });


            return res.status(201).json({ success: 1, msg: "Registration Successful" });
        } catch (err) {

        }
    },
    login: async (req, res) => {
        try {
           
        } catch (err) {
            
        }
    }
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ADMIN_ACCESS_TOKEN_SECRET, { expiresIn: '1m' })
}
const refreshAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ADMIN_REFRESH_TOKEN_SECRET, { expiresIn: '90d' })
}


module.exports = authCrtl;