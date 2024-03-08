const express = require('express')
const { sessionChecker } = require('../../middlewares/session')
const controller = require('./memberController')
const router = express.Router()

router.post('/add_member', controller.add_member)
router.get('/get_member', controller.get_members)
router.put('/update_member/:member_id', controller.update_member);
router.post('/delete_member', controller.delete_member);
router.get('/get_memberdetail/:member_id', controller.get_memberdetail)
router.get('/getpassword/:member_id', controller.get_password)

module.exports = router