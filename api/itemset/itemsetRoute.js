const express = require('express');
const { sessionChecker } = require('../../middlewares/session');
const controller = require('./itemsetController');
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


router.post('/twoproduct', controller.getTwoProduct);
router.post('/additemset', controller.add_itemset);
router.get('', controller.get_itemset);


module.exports = router;