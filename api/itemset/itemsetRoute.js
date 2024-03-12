const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('./itemsetController');

// Configure storage for multer
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/product/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Initialize multer with the defined storage
const upload = multer({ storage: storage });

// Define the route for adding an itemset, using multer middleware for file upload
router.post('/additemset', upload.single('image_itemset'), controller.add_itemset);
router.put('/updateitemset/:itemset_id', controller.update_itemset);

// Other routes
router.post('/twoproduct', controller.getTwoProduct);
router.get('', controller.get_itemset);

module.exports = router;
