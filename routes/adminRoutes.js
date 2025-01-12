const router = require('express').Router()

const authCrtl = require('../controllers/admin/auth')

router.post('/register', authCrtl.register)
router.post('/login', authCrtl.login)

module.exports = router