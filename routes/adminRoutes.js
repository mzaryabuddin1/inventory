const router = require('express').Router()

const authCrtl = require('../controllers/admin/auth')

router.post('/', authCrtl.register)

module.exports = router