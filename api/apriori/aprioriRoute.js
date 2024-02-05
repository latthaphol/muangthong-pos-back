const express = require('express');
const aprioriController = require('./aprioriController');

const router = express.Router();

// Define your Apriori routes
router.get('/generate-apriori', aprioriController.apriorigenerate);

module.exports = router;
