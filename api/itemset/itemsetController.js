const model = require('./itemsetModel');
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const { myFs } = require('../..');
const fs = require('fs').promises;
const path = require('path');
const knex = require('../../config/database');

class itemsetController {

    async getTwoProduct(req, res) {
        try {
            const { product_id1, product_id2 } = req.body;
            console.log("Product IDs:", product_id1, product_id2);
            // Fetch data for both products
            const product1 = await model.getProductDetails(product_id1);
            const product2 = await model.getProductDetails(product_id2);

            if (!product1 || !product2) {
                console.log("Error: One or both products not found or do not have active lots");
                return res.status(404).json({
                    success: false,
                    message: "One or both products not found or do not have active lots"
                });
            }

            // Send the products as a successful response
            return res.status(200).json({
                success: true,
                message: 'Products found',
                data: {
                    product1, // This now corresponds to the first product details
                    product2  // This now corresponds to the second product details
                }
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
}

module.exports = new itemsetController();
