const router = require('express').Router()

const authCrtl = require('../controllers/admin/auth')

router.post('/register', authCrtl.register)
router.post('/login', authCrtl.login)
router.post('/forgotPassword', authCrtl.forgotPassword)
router.post('/resetPassword', authCrtl.resetPassword)

module.exports = router