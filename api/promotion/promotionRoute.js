const express = require('express');
const { sessionChecker } = require('../../middlewares/session');
const controller = require('./promotionController');
const router = express.Router();

// Existing routes
router.post('/addpromotion', controller.addPromotion);
router.get('/update-promotion-status', controller.updatePromotionStatus);
router.get('', controller.getPromotion);
router.post('/deletepromotion', controller.softDeletePromotion);
router.post('/updatepromotion/:promotion_id', controller.updatePromotion);
router.get('/switchactive/:promotion_id', controller.switchActive);
// on or off


module.exports = router;
