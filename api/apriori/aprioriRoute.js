const express = require('express');
const aprioriController = require('./aprioriController');

const router = express.Router();

// Define your Apriori routes
router.get('/calculateItemSupport', aprioriController.calculateItemSupport);
router.get('/calculateconfidenceandlif', aprioriController.calculateconfidenceandlif);

module.exports = router;
