const express = require('express')
const { sessionChecker } = require('../../middlewares/session')
const controller = require('./employeeController')
const router = express.Router()

router.post('/add_employee', controller.add_employee)
router.get('/get_employee', controller.get_employee)

module.exports = router