// AprioriModel.js
const knex = require('../../config/database');

class AprioriModel {
  async calculateItemSupport() {
    try {
      // Use Knex.js to calculate Support for each pair of products
      const results = await knex('order_products as op1')
        .select(
          knex.raw('DISTINCT p1.product_name as Item1'),
          'p2.product_name as Item2',
          knex.raw('COUNT(op1.product_id) / total_orders as Support')
        )
        .leftJoin('product as p1', 'op1.product_id', 'p1.product_id')
        .leftJoin('order_products as op2', 'op1.order_id', 'op2.order_id')
        .leftJoin('product as p2', 'op2.product_id', 'p2.product_id')
        .crossJoin(knex.raw('(SELECT COUNT(*) as total_orders FROM order_products) as order_count'))
        .groupBy('p1.product_name', 'p2.product_name')
        .having(knex.raw('Support >= 0.1'))
        .having(knex.raw('Item1 < Item2'))

      return results;
    } catch (error) {
      // Handle any errors that occur
      console.error(error);
      throw error;
    }
  }

  static async calculateSupport(Item) {
    try {
      // Query the order_products table to count the occurrences of the Item
      const supportValue = await knex('order_products')
        .where('product_id', Item) // Assuming product_id is the column where the item is stored
        .count();

      if (supportValue.length > 0) {
        // Assuming that the count result is available in the first row
        const supportCount = supportValue[0].count;
        const totalOrders = await knex('order_products').count(); // Total number of orders

        // Calculate support as the ratio of occurrences of the item to total orders
        const support = supportCount / totalOrders[0].count;

        return support;
      } else {
        // Return a default support value if no data is found
        return 0.0;
      }
    } catch (error) {
      console.error(error);
      throw error; // Handle the error as needed
    }
  }


}



module.exports = AprioriModel;
