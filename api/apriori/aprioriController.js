const knex = require('../../config/database');
const AprioriModel = require('./aprioriModel');

class AprioriController {
  async findFrequentItemsets(req, res) {
    try {
      // Instantiate AprioriModel
      const aprioriModel = new AprioriModel();

      // Call the getSoldProducts method
      const soldProducts = await aprioriModel.getSoldProducts();

      // Count the number of order_ids
      const soldProductsCount = soldProducts.length;
      console.log("จำนวน order_id ที่ได้รับ:", soldProductsCount);

      // Add soldProductsCount to the response JSON
      const responseJSON = {
        soldProducts: soldProducts,
        soldProductsCount: soldProductsCount
      };

      // Send the retrieved data back as JSON
      res.json(responseJSON);
    } catch (error) {
      console.error('Error in findFrequentItemsets:', error);
      res.status(500).send('Internal Server Error');
    }
  }





  async calculateSupportForItemset(req, res) {
    try {
      // Instantiate AprioriModel
      const aprioriModel = new AprioriModel();

      // Call the calculateSupportForProducts method
      const supportForProducts = await aprioriModel.calculateSupportForItemset();

      // Send the retrieved data back as JSON
      res.json(supportForProducts);
    } catch (error) {
      console.error('Error in  calculateSupportForItemset:', error);
      res.status(500).send('Internal Server Error');
    }
  }



  async calculateSupportForItemsetPairs(req, res) {
    try {
      // Instantiate AprioriModel
      const aprioriModel = new AprioriModel();

      // Call the calculateSupportForItemset method to get combinedPairs
      const combinedPairs = await aprioriModel.calculateSupportForItemset();

      // Call the calculateSupportForItemsetPairs method with combinedPairs as argument
      const supportForItemsetPairs = await aprioriModel.calculateSupportForItemsetPairs(combinedPairs);

      // Send the retrieved data back as JSON
      res.json(supportForItemsetPairs);
    } catch (error) {
      console.error('Error in calculateSupportForItemsetPairs:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  // async calculateConfidence(req, res) {
  //   try {
  //     // Instantiate AprioriModel
  //     const aprioriModel = new AprioriModel();
  
  //     // Call the calculateSupportForItemset method to get combinedPairs
  //     const combinedPairs = await aprioriModel.calculateSupportForItemset();
  
  //     // Call the calculateSupportForItemsetPairs method to get support for itemset pairs
  //     const supportCounts = await aprioriModel.calculateSupportForItemsetPairs(combinedPairs);
  
  //     // Call the calculateConfidence method with combinedPairs and supportCounts as arguments
  //     const confidenceForItemsetPairs = await aprioriModel.calculateConfidenceAndLift(combinedPairs, supportCounts);
  
  //     // Send the retrieved data back as JSON
  //     res.json(confidenceForItemsetPairs);
  //   } catch (error) {
  //     console.error('Error in calculateConfidence:', error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // }

  async calculateLifePairs(req, res) {
    try {
      // Instantiate AprioriModel
      const aprioriModel = new AprioriModel();
  
      // Call the calculateSupportForItemset method to get combinedPairs
      const combinedPairs = await aprioriModel.calculateSupportForItemset();
  
      // Call the calculateSupportForItemsetPairs method to get support for itemset pairs
      const supportCounts = await aprioriModel.calculateSupportForItemsetPairs(combinedPairs);
  
      // Call the calculateConfidence method with combinedPairs and supportCounts as arguments
      const confidenceForItemsetPairs = await aprioriModel.calculateConfidenceAndLiftPairs(combinedPairs, supportCounts);
  
      // Send the retrieved data back as JSON
      res.json(confidenceForItemsetPairs);
    } catch (error) {
      console.error('Error in calculateConfidence:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = new AprioriController();
