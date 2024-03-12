const express = require('express');
const { sessionChecker } = require('../../middlewares/session');
const controller = require('./DashboardController');
const router = express.Router();

// Existing routes

router.get('', controller.getPromotion);

// on or off
//Add the new statistics routes Dashboard
router.get('/employees-count', controller.getEmployeesCount);
router.get('/members-count', controller.getMembersCount);
router.get('/profits-from-promotions', controller.getProfitsFromPromotions);
router.get('/profits-from-regular-sales', controller.getProfitsFromRegularSales);
router.get('/profits-sales', controller.getTotalSales);
router.get('/top-selling-products', controller.getTopSellingProducts);
router.get('/monthly-sales', controller.getMonthlySales);
router.get('/getordercount', controller.getOrderCount);

router.get('/Dashboard4', controller.getYearlySales);

router.get('/Dashboard6', controller.getDailySales);
router.get('/Dashboard2', controller.getWeeklySales);
router.get('/Dashboard', controller.getMonthlySales);

module.exports = router;
