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
router.post('/update-product-quantities', async (req, res) => {
    try {
        const { updatedProducts } = req.body;
        await productModel.updateProductQuantities(updatedProducts);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product quantities:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/add_product', upload.single("product_image"), controller.add_product)
router.post('/update_product', upload.single("product_image"), controller.update_product)
router.post('/active_product', controller.active_product)
router.get('', controller.get_product)
router.get('/filter-products', controller.filter_product);
router.post('/reduce-product-qty', controller.reduce_product_qty);

module.exports = router