const knex = require('../../config/database');

class PromotionModel {


  
  async calculateDailySales() {
    const dailySales = await knex('order_products')
      .select(knex.raw("DATE(order_date) as date"), knex.raw("SUM(total_price) as totalSales"))
      .groupByRaw("DATE(order_date)")
      .orderBy("date", "asc");

    return dailySales;
  }


  async getDailySales() {
    try {
      const result = await knex('order')
        .join('order_products', 'order.order_id', '=', 'order_products.order_id')
        .select(
          knex.raw('DATE(order.order_date) as day'),
          knex.raw('SUM(order_products.quantity * (order_products.unit_price - order_products.cost_price)) as totalProfit'),
          knex.raw('SUM(order.total_amount) as totalSales'),
          knex.raw('COUNT(DISTINCT order.order_id) as totalOrders')
        )
        .groupByRaw('DATE(order.order_date)')
        .orderBy('day', 'desc');
  
      return result;
    } catch (error) {
      console.error(error);
      throw error; 
    }
  }
    
  async getWeeklySales() {
    try {
      const weeklySales = await knex('order')
        .join('order_products', 'order.order_id', '=', 'order_products.order_id')
        .select(
          knex.raw("YEARWEEK(order.order_date, 1) as week"),
          knex.raw('SUM(order_products.quantity * (order_products.unit_price - order_products.cost_price)) as totalProfit'),
          knex.raw("COUNT(DISTINCT order.order_id) as totalOrders"),
          knex.raw("SUM(order.total_amount) as totalSales")
        )
        .groupByRaw("YEARWEEK(order.order_date, 1)")
        .orderBy("week", "asc");
  
      return weeklySales;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async getMonthlySales() {
    try {
      const monthlySales = await knex('order')
        .join('order_products', 'order.order_id', '=', 'order_products.order_id')
        .select(
          knex.raw("YEAR(order.order_date) as year"),
          knex.raw("MONTH(order.order_date) as month"),
          knex.raw('SUM(order_products.quantity * (order_products.unit_price - order_products.cost_price)) as totalProfit'),
          knex.raw("COUNT(DISTINCT order.order_id) as totalOrders"),
          knex.raw("SUM(order.total_amount) as totalSales")
        )
        .groupByRaw("YEAR(order.order_date), MONTH(order.order_date)")
        .orderByRaw("YEAR(order.order_date) desc, MONTH(order.order_date) desc");
  
      return monthlySales;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async getYearlySales() {
    try {
      const yearlySales = await knex('order')
        .join('order_products', 'order.order_id', '=', 'order_products.order_id')
        .select(
          knex.raw("YEAR(order.order_date) as year"),
          knex.raw('SUM(order_products.quantity * (order_products.unit_price - order_products.cost_price)) as totalProfit'),
          knex.raw("COUNT(DISTINCT order.order_id) as totalOrders"),
          knex.raw("SUM(order.total_amount) as totalSales")
        )
        .groupByRaw("YEAR(order.order_date)")
        .orderBy("year", "asc");
  
      return yearlySales;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  
}

module.exports = new PromotionModel();
