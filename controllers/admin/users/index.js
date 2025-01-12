const Joi = require('joi');
const md5 = require('md5');
const Admin_users = require('../../../models/Admin_users');

const userCrtl = {
    get_all: async (req, res) => {
        try {
            const schema = Joi.object({
                page: Joi.number().integer().min(1).default(1),
                limit: Joi.number().integer().min(1).max(100).default(10)
            });

            const { error, value } = schema.validate(req.query);

            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const { page, limit } = value;
            const skip = (page - 1) * limit;

            const data = await Admin_users.find().select('-password -otp -otp_expire_time -otp_used -__v').skip(skip).limit(limit);
            const totalRecords = await Admin_users.countDocuments();

            return res.status(200).json({
                success: "Fetch Successful",
                data,
                pagination: {
                    totalRecords,
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / limit)
                }
            });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
    get_one: async (req, res) => {
        try {
            const schema = Joi.object({
                id: Joi.string().hex().length(24).required() // Validate MongoDB ObjectId
            });

            const { error, value } = schema.validate(req.params);

            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const data = await Admin_users.findById(value.id).select('-password -otp -otp_expire_time -otp_used -__v');

            if (!data) {
                return res.status(404).json({ error: "Record not found" });
            }

            return res.status(200).json({
                success: "Fetch Successful",
                data
            });
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
    update_one: async (req, res) => {
        try {
            const schema = Joi.object({
                id: Joi.string().hex().length(24).required(),
                first_name: Joi.string().min(2).max(50).optional(),
                last_name: Joi.string().min(2).max(50).optional(),
                email: Joi.string().email().optional(),
                status: Joi.boolean().optional(),
                password: Joi.string().min(6).pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$&*]).*$')).optional()
            });

            const { error, value } = schema.validate({...req.body, ...req.params});

            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const user = await Admin_users.findById(value.id);

            if (!user) 
                return res.status(404).json({ error: "User not found" });
            

            if (value.password) 
                value.password = md5(value.password)

            if (value.email){
                const existingUser = await Admin_users.findOne({ email: value.email });
                if (existingUser && existingUser._id.toString()!== value.id) 
                    return res.status(400).json({ error: "Email already exists" });
            } 

            await Admin_users.updateOne({ _id: value.id }, { $set: value });

            return res.status(200).json({
                success: "Update Successful"
            });

        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = userCrtl;