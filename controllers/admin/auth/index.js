const Joi = require('joi');
const jwt = require('jsonwebtoken');
const Admin_users = require('../../../models/Admin_users');
const md5 = require('md5');

const authCrtl = {
    register: async (req, res) => {
        try {
            const schema = Joi.object({
                first_name: Joi.string().min(2).max(50).required(),
                last_name: Joi.string().min(2).max(50).required(),
                email: Joi.string().email().required(),
                password: Joi.string().min(6).pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*]).*$')).required()
            });

            const { error, value } = schema.validate(req.body);

            if (error) 
                return res.status(400).json({ error:  error.details[0].message });

            const existingUser = await Admin_users.findOne({ email: value.email });

            if (existingUser)
                return res.status(400).json({ error: "Email Already Exists!" });

            // Hash the password
            const hashedPassword = md5(value.password);

            const user = new Admin_users({
                first_name: value.first_name,
                last_name: value.last_name,
                email: value.email,
                password: hashedPassword
            });

            await user.save();

            const access_token = createAccessToken({ id: user._id });


            return res.status(201).json({ success: "Registration Successful", access_token });
        } catch (err) {
            console.log(err.message)
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
    login: async (req, res) => {
        try {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            });

            const { error, value } = schema.validate(req.body);

            if (error)
                return res.status(400).json({ error: error.details[0].message });

            const user = await Admin_users.findOne({ email: value.email });

            if (!user)
                return res.status(400).json({ error: "Invalid email or password" });

            const hashedPassword = md5(value.password);

            if (user.password !== hashedPassword)
                return res.status(400).json({ error: "Invalid email or password" }); 

            const access_token = createAccessToken({ id: user._id });

            return res.status(200).json({
                success: "Login Successful",
                access_token
            });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ADMIN_ACCESS_TOKEN_SECRET, { expiresIn: '1m' })
}


module.exports = authCrtl;