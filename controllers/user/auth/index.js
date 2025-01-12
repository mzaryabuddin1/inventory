const Joi = require('joi');
const jwt = require('jsonwebtoken');
const Normal_users = require('../../../models/Normal_users');
const md5 = require('md5');
const { sendEmail } = require('../../../helper/functions');

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

            const existingUser = await Normal_users.findOne({ email: value.email });

            if (existingUser)
                return res.status(400).json({ error: "Email Already Exists!" });

            // Hash the password
            const hashedPassword = md5(value.password);

            const user = new Normal_users({
                first_name: value.first_name,
                last_name: value.last_name,
                email: value.email,
                password: hashedPassword
            });

            await user.save();

            const access_token = createAccessToken({ id: user._id });


            return res.status(201).json({ success: "Registration Successfull", access_token });
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

            const user = await Normal_users.findOne({ email: value.email });

            if (!user)
                return res.status(400).json({ error: "Email does not exists" });

            const hashedPassword = md5(value.password);

            if (user.password !== hashedPassword)
                return res.status(400).json({ error: "Incorrect password" }); 

            const access_token = createAccessToken({ id: user._id });

            return res.status(200).json({
                success: "Login Successful",
                access_token
            });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const schema = Joi.object({
                email: Joi.string().email().required(),
            });

            const { error, value } = schema.validate(req.body);

            if (error)
                return res.status(400).json({ error: error.details[0].message });

            const user = await Normal_users.findOne({ email: value.email });

            if (!user)
                return res.status(400).json({ error: "Email does not exist" });

            // Generate OTP and set expiration time
            const otp = Math.floor(100000 + Math.random() * 900000);
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);

            user.otp = otp;
            user.otp_used = false;
            user.otp_expire_time = expireTime;

            await user.save();

            const message = `${otp} is your OTP for password reset. It will expire in 5 minutes.`;

            // Send email
            await sendEmail({ to: user.email, subject: "Password Reset OTP", message });

            return res.status(200).json({ success: "OTP has been sent to your email. Valid for 5 minutes." });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(6).pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*]).*$')).required(),
                otp: Joi.string().min(6).max(6).required(),
            });

            const { error, value } = schema.validate(req.body);

            if (error)
                return res.status(400).json({ error: error.details[0].message });

            const user = await Normal_users.findOne({ email: value.email });

            if (!user)
                return res.status(400).json({ error: "Email does not exist" });

            if (user.otp_used)
                return res.status(400).json({ error: "OTP already used" });

            if (user.otp !== value.otp)
                return res.status(400).json({ error: "Incorrect OTP" });

            if (user.otp_expire_time < new Date())
                return res.status(400).json({ error: "OTP has been expired" });

            // Update password and reset OTP
            user.password = md5(value.password);
            user.otp_used = true;
            user.otp = null;
            user.otp_expire_time = null;

            await user.save();

            const message = `Your password has been successfully updated.`;

            // Send email
            await sendEmail({ to: user.email, subject: "Password Reset Confirmation", message });

            return res.status(200).json({ success: "Password has been successfully updated." });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.USER_ACCESS_TOKEN_SECRET, { expiresIn: '365d' })
}


module.exports = authCrtl;