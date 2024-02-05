// AprioriController.js

const { Apriori } = require('node-apriori');
const knex = require('../../config/database');
const { success, failed } = require('../../config/response');

class AprioriController {
    constructor() {
        this.apriorigenerate = this.apriorigenerate.bind(this);
        this.mapProductNames = this.mapProductNames.bind(this);
    }

    async apriorigenerate(req, res) {
        try {
            // Retrieve Data from the Database
            const transactionData = await knex('order_products').select(['order_id', 'product_id']);

            // Prepare Transaction Data
            const transactionsMap = transactionData.reduce((acc, row) => {
                if (!acc[row.order_id]) {
                    acc[row.order_id] = [];
                }
                acc[row.order_id].push(row.product_id);
                return acc;
            }, {});
            const transactions = Object.values(transactionsMap);

            // Execute the Apriori Algorithm
            const minSupport = 0.4;
            const apriori = new Apriori(minSupport);
            const frequentItemsets = [];
            apriori.on('data', (itemset) => frequentItemsets.push(itemset));
            await apriori.exec(transactions);

            // Map product IDs to names
            const productsWithNames = await this.mapProductNames(frequentItemsets);

            // Send results as a response
            success(res, { frequentItemsets: productsWithNames });
        } catch (error) {
            console.error('Error:', error);
            failed(res, 'An error occurred.', 500);
        }
    }

    async mapProductNames(frequentItemsets) {
        // Retrieve all products from the database
        const products = await knex('product').select(['product_id', 'product_name']);
        const productMap = products.reduce((map, product) => {
            map[product.product_id] = product.product_name;
            return map;
        }, {});
    
        // Replace product IDs with their names in frequentItemsets
        return frequentItemsets.map(itemset => {
            return {
                ...itemset,
                items: itemset.items.map(id => ` ${id}, ${productMap[id]}`)
            };
        });
    }
}

module.exports = new AprioriController();
