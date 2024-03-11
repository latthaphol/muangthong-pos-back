const express = require('express');
const { sessionChecker } = require('../../middlewares/session');
const controller = require('./structController');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage(); // ให้อัพโหลดไฟล์เข้า memory
const upload = multer({ storage: storage });

router.get('/unit', controller.unit);
router.post('/add_unit', controller.add_unit);
router.get('/product_type', controller.product_type);
router.post('/add_product_type', upload.single('image'), controller.add_product_type);
router.post('/soft-delete-unit', controller.soft_delete_unit);
router.post('/soft-delete-product-type', controller.soft_delete_product_type);
router.put('/update_product_type', upload.single('image'), controller.update_product_type);
router.put('/update_unit', controller.update_unit);

module.exports = router;
