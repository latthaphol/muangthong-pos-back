const express = require('express');
const { sessionChecker } = require('../../middlewares/session');
const controller = require('./productController');
const router = express.Router();
const multer = require('multer');


let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/product/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });


router.post('/add_product', upload.single("product_image"), controller.add_product);
router.put('/update_product', upload.single("product_image"), controller.update_product);
router.post('/active_product', controller.active_product);
router.get('', controller.get_product);
router.get('/filter-products', controller.filter_product);
router.post('/confirm_order', controller.confirm_order); 
router.get('/getordetail', controller.getOrderDetails);
router.post('/return_product', controller.return_product);
router.get('/get_receipt/:order_id', controller.get_receipt);
module.exports = router;
