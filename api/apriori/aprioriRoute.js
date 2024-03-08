const express = require('express');
const aprioriController = require('./aprioriController');

const router = express.Router();

// Define your Apriori routes
router.get('/getsold', (req, res) => aprioriController.findFrequentItemsets(req, res));
router.get('/calculateSupportForItemset', aprioriController.calculateSupportForItemset);
router.get('/calculateSupportForItemsetPairs', aprioriController.calculateSupportForItemsetPairs);
router.get('/aprioripair', aprioriController.calculateLifePairs);

module.exports = router;
