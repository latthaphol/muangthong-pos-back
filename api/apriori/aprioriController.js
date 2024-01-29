const aprioriModel = require('./aprioriModel');
const { success, failed } = require('../../config/response');
const knex = require('../../config/database');

class AprioriController {
    async findFrequentItemsets(req, res) {
        try {
            // Load data from the database or other sources
            const orders = await knex('order').select('*');
            const orderProducts = await knex('order_products').select('*');

            // Preprocess data
            const basket = preprocessData(orders, orderProducts);

            // Apriori Algorithm: Calculate frequent itemsets
            const frequentItemsets = aprioriModel.calculateFrequentItemsets(basket);

            // Return successful response with frequent itemsets
            return res.status(200).json({ success: true, message: 'Frequent itemsets calculated successfully', data: { frequentItemsets } });
        } catch (error) {
            // Return failed response on error
            return failed(res, 'Error occurred while calculating frequent itemsets', error);
        }
    }


    async generateAssociationRules(req, res) {
        try {
            // Load data from the database or other sources
            const orders = await knex('order').select('*');
            const orderProducts = await knex('order_products').select('*');

            // Preprocess data
            const basket = preprocessData(orders, orderProducts);
            const minSupport = 5;
            // Apriori Algorithm: Calculate frequent itemsets
            const frequentItemsets = await aprioriModel.calculateFrequentItemsets(basket, minSupport);

            // Apriori Algorithm: Generate association rules
            const minConfidence = 0.7; // Set an appropriate value
            const associationRules = await aprioriModel.generateAssociationRules(frequentItemsets, minConfidence);



            // Return successful response with association rules
            success(res, associationRules, 'Association rules generated successfully');
        } catch (error) {
            // Return failed response on error
            failed(res, 'Error occurred while generating association rules', error);
        }

    }

    // Helper function to preprocess data

}
function preprocessData(orders, orderProducts) {
    // Combine order information with corresponding order products
    const combinedData = combineOrderData(orders, orderProducts);

    // Extract transactions from the combined data
    const transactions = extractTransactions(combinedData);

    // Convert transactions to a basket format (array of arrays)
    const basket = convertToBasket(transactions);

    return basket;
}

// Combine order information with corresponding order products
function combineOrderData(orders, orderProducts) {
    // Assuming there's a common identifier, such as order_id, to link orders and products
    const combinedData = orders.map(order => {
        const productsInOrder = orderProducts.filter(product => product.order_id === order.order_id);
        return {
            ...order,
            products: productsInOrder,
        };
    });

    return combinedData;
}

// Extract transactions from the combined data
function extractTransactions(combinedData) {
    // Assuming each order with its products is a transaction
    const transactions = combinedData.map(order => order.products.map(product => product.product_id));
    return transactions;
}

// Convert transactions to a basket format (array of arrays)
function convertToBasket(transactions) {
    // Your dataset may require further processing or transformation based on the Apriori algorithm requirements
    // This is a simple example assuming transactions are already in a suitable format
    return transactions;
}

module.exports = {
    preprocessData,
};
module.exports = new AprioriController();
