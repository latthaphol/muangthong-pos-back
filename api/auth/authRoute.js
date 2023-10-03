const express = require('express')
const { sessionChecker } = require('../../middlewares/session')
const controller = require('./authController')
const router = express.Router()

router.post('/login', controller.login)
router.post('/logout', controller.logout)
router.post('/register', controller.register)
router.post('/register_member', controller.register_member)
// router.post('/login_member', controller.login_member)
router.get('/get_members', controller.getMembers);
router.post('/update_profile', controller.updateProfile);

module.exports = router