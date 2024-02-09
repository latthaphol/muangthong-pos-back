const knex = require('../../config/database');
const AprioriModel = require('./aprioriModel');

class AprioriController {
    async calculateItemSupport(req, res) {
        try {
            const aprioriModel = new AprioriModel(); // Create an instance of AprioriModel
            const results = await aprioriModel.calculateItemSupport(); // Call the method on the instance

            if (results) {
                return res.status(200).json({
                    success: true,
                    message: 'Results success',
                    data: results
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Failed to return product',
                    data: null
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }

    async calculateconfidenceandlif(req, res) {
        try {
            // Get the results from calculateItemSupport
            const aprioriModel = new AprioriModel(); // Create an instance of AprioriModel
            const supportResults = await aprioriModel.calculateItemSupport(); // Call the method on the instance
    
            // Calculate Confidence and Lift for each pair of products from supportResults
            const resultsWithConfidenceAndLift = supportResults.map(async (result) => {
                const { Item1, Item2, Support } = result;
    
                // Calculate Support for Item1 and Item2
                const SupportItem1 = await AprioriModel.calculateSupport(Item1);
                const SupportItem2 = await AprioriModel.calculateSupport(Item2);
    
                // Calculate Confidence and Lift
                const Confidence = Support / SupportItem1;
                const Lift = Support / (SupportItem1 * SupportItem2);
    
                return { Item1, Item2, Support, Confidence, Lift };
            });
    
            // Check if results exist and send response
            if (resultsWithConfidenceAndLift) {
                return res.status(200).json({
                    success: true,
                    message: 'Results success',
                    data: resultsWithConfidenceAndLift
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Failed to return product',
                    data: null
                });
            }
    
        } catch (error) {
            // Handle any errors that occur
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }
    
    

}

module.exports = new AprioriController();
