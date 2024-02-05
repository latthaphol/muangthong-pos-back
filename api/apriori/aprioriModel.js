const knex = require('../../config/database');
const { Apriori } = require('node-apriori');

class AprioriModel {
  static async preprocessData(orders, orderProducts) {
    try {
      const transactions = [];

      // Loop through orders
      for (const order of orders) {
        const transaction = [];

        // Find order products associated with the current order
        const associatedProducts = orderProducts.filter((product) => product.orderId === order.id);

        // Add product IDs to the transaction
        for (const product of associatedProducts) {
          transaction.push(product.productId);
        }

        transactions.push(transaction);
      }

      return transactions;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = AprioriModel;
