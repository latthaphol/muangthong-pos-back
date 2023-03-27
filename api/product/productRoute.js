const express = require('express')
const { sessionChecker } = require('../../middlewares/session')
const controller = require('./productController')
const router = express.Router()
const multer = require('multer');
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/product/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/add_product', upload.single("product_image"), controller.add_product)
router.post('/update_product', upload.single("product_image"), controller.update_product)
router.post('/active_product', controller.active_product)
router.get('', controller.get_product)

module.exports = router