const express = require('express')
const { sessionChecker } = require('../../middlewares/session')
const controller = require('./authController')
const router = express.Router()

router.post('/login', controller.login)
router.post('/logout', controller.logout)
router.post('/register', controller.register)

module.exports = router