const express = require('express');
const { sessionChecker } = require('../../middlewares/session');
const controller = require('./structController');
const router = express.Router();

router.get('/unit', controller.unit);
router.post('/add_unit', controller.add_unit);
router.get('/product_type', controller.product_type);
router.post('/add_product_type', controller.add_product_type);

router.post('/soft-delete-unit', controller.soft_delete_unit);
router.post('/soft-delete-product-type', controller.soft_delete_product_type);

module.exports = router;
