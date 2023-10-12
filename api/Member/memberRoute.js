const express = require('express')
const { sessionChecker } = require('../../middlewares/session')
const controller = require('./memberController')
const router = express.Router()

router.post('/add_member', controller.add_member)
router.get('/get_member', controller.get_members)
router.put('/update_member/:member_id', controller.update_member);
router.delete('/delete_member/:member_id', controller.delete_member);

module.exports = router