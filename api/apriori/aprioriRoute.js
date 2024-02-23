const express = require('express');
const aprioriController = require('./aprioriController');

const router = express.Router();

// Define your Apriori routes
router.get('/getsold', (req, res) => aprioriController.findFrequentItemsets(req, res));
router.get('/calculateSupportForProduct', aprioriController.calculateSupportForProduct);
router.get('/calculateitemset', aprioriController.calculateitemset);
router.get('/getitemset',aprioriController.findItemsetInReceipts);
router.get('/calculateSupportForItemset', aprioriController.calculateSupportForItemset);
router.get('/calculateSupportForItemsetPairs', aprioriController.calculateSupportForItemsetPairs);
module.exports = router;
