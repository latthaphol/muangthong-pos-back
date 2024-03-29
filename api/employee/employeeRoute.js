const express = require('express')
const { sessionChecker } = require('../../middlewares/session')
const controller = require('./employeeController')
const router = express.Router()

router.post('/add_employee', controller.add_employee)
router.get('/get_employee', controller.get_employee)
router.put('/update_employee/:employee_id', controller.update_employee);
router.post('/delete_employee', controller.delete_employee);
router.post('/changepassword', controller.changePassword);

module.exports = router