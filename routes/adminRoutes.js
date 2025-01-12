const router = require('express').Router()

const authCrtl = require('../controllers/admin/auth')
const userCrtl = require('../controllers/admin/users')
const adminAuth = require('../middlewares/admin_auth')

router.post('/register', authCrtl.register)
router.post('/login', authCrtl.login)
router.post('/forgotPassword', authCrtl.forgotPassword)
router.post('/resetPassword', authCrtl.resetPassword)

router.get('/users', adminAuth, userCrtl.get_all)
router.get('/user/:id', adminAuth, userCrtl.get_one)
router.patch('/user/:id', adminAuth, userCrtl.update_one)


module.exports = router