const express = require('express');
const aprioriController = require('./aprioriController');

const router = express.Router();

// Define your Apriori routes
router.get('/find-frequent-itemsets', aprioriController.findFrequentItemsets);
router.get('/generate-association-rules', aprioriController.generateAssociationRules);

module.exports = router;
