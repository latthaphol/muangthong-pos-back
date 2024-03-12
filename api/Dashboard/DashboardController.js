const model = require('./DashboardModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const knex = require('../../config/database');
const moment = require('moment');
const DashboardModel = require('./DashboardModel');



class DashboardController {


  async getProductLotQuantities(req, res) {
    try {
      const productLotQuantities = await knex('product_lot')
        .join('product', 'product.product_id', '=', 'product_lot.product_id')
        .select('product.product_id', 'product.product_name', 'product_lot.product_lot_id', 'product_lot.product_lot_qty')
        .where('product_lot.is_active', '=', 1)
        .orderBy('product.product_id', 'asc', 'product_lot.product_lot_id', 'asc');
      
      success(res, productLotQuantities, "Product lot quantities");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  


  async getPromotion(req, res) {
    try {
      const result = await knex('promotion').select('*');
      success(res, result, "Promotion list");
    } catch (error) {
      console.error(error); // แสดงข้อผิดพลาดในรูปแบบของ console.error เพื่อให้เห็นว่ามีข้อผิดพลาดอะไรเกิดขึ้น
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getPromotion(req, res) {
    try {
      const result = await knex('promotion').select('*');
      success(res, result, "Promotion list");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getEmployeesCount(req, res) {
    try {
      const employeeCount = await knex('user').where('user_type', '=', 0).count('user_id as count').first();
      success(res, { employeeCount: employeeCount.count }, "Number of Employees");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getMembersCount(req, res) {
    try {
      const memberCount = await knex('member').count('member_id as count').first();
      success(res, { memberCount: memberCount.count }, "Number of Members");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getProfitsFromPromotions(req, res) {
    try {
      const profitsFromPromotions = await knex('order')
        .join('promotion', 'order.promotion_id', '=', 'promotion.promotion_id')
        .sum('total_amount as total')
        .where('order.promotion_id', '!=', null)
        .first();
      success(res, { profitsFromPromotions: profitsFromPromotions.total || 0 }, "Profits from Promotions");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getProfitsFromRegularSales(req, res) {
    try {
      const profitsFromRegularSales = await knex('order')
        .join('promotion', 'order.promotion_id', '=', 'promotion.promotion_id')
        .sum('total_amount as total')
        .where('order.promotion_id', '=', null)
        .first();
      success(res, { profitsFromRegularSales: profitsFromRegularSales.total || 0 }, "Profits from Regular Sales");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getTotalSales(req, res) {
    try {
      const totals = await knex('order')
        .join('order_products', 'order.order_id', '=', 'order_products.order_id')
        .where('order.status', 'success')
        .select(
          knex.raw('SUM(DISTINCT order.total_amount) as totalSales'),
          knex.raw('SUM(order_products.cost_price * order_products.quantity) as totalCostPrice'),
          knex.raw('SUM(order_products.unit_price * order_products.quantity) as totalUnitPrice')
        )
        .first();

      success(
        res,
        {
          totalSales: totals.totalSales || 0,
          totalUnitPrice: totals.totalUnitPrice || 0,
          totalCostPrice: totals.totalCostPrice || 0
        },
        "Total Sales, Unit Price, and Cost Price"
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }




  async  getTopSellingProducts(req, res) {
    try {
        const topSellingProducts = await knex('product')
            .leftJoin('order_products', 'product.product_id', '=', 'order_products.product_id')
            .leftJoin('product_type', 'product.product_type_id', '=', 'product_type.product_type_id')
            .leftJoin(knex('product_lot')
                .select('product_id', knex.raw('COALESCE(SUM(product_lot_qty), 0) as Product_Lot_Quantity'))
                .where('is_active', '=', 1)
                .groupBy('product_id')
                .as('product_lots'), 'product.product_id', '=', 'product_lots.product_id')
            .select(
                'product.product_id as Product_ID',
                'product.product_name as Product_Name',
                'product_type.product_type as Product_Type',
                knex.raw('COALESCE(SUM(order_products.quantity), 0) as Stock'),
                knex.raw('COALESCE(SUM(order_products.quantity * order_products.unit_price), 0) as Total_Sales'),
                'product_lots.Product_Lot_Quantity'
            )
            .groupBy('product.product_id')
            .orderBy(knex.raw('COALESCE(SUM(order_products.quantity * order_products.unit_price), 0)'), 'desc')
            .limit(10);

        success(res, topSellingProducts, "Top Selling Products");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


  

  async getMonthlySales(req, res) {
    try {
      const monthlySales = await knex('order')
        .join('order_products', 'order.order_id', '=', 'order_products.order_id')
        .where('order.status', 'success')
        .select(
          knex.raw('DATE_FORMAT(order.order_date, "%Y-%m") as monthYear'),
          knex.raw('SUM(DISTINCT order.total_amount) as totalSales'),
          knex.raw('SUM(order_products.cost_price * order_products.quantity) as totalCostPrice'),
          knex.raw('SUM(order_products.unit_price * order_products.quantity) as totalUnitPrice')
        )
        .groupBy('monthYear')
        .orderBy('monthYear', 'asc');

      success(res, monthlySales, "Monthly Sales Report");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  async getOrderCount(req, res) {
    try {
      const orderCount = await knex('order').count('order_id as count').first();
      success(res, { orderCount: orderCount.count }, "Number of Orders");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  

 

  async getDailySales(req, res) {
    try {
      // Assuming getDailySales is implemented in DashboardModel
      const dailySales = await DashboardModel.getDailySales();
      success(res, dailySales, "Daily Sales Data");
    } catch (error) {
      console.error(error);
      failed(res, "Failed to fetch daily sales data", error);
    }
  }
      
// Method to get weekly sales data
async getWeeklySales(req, res) {
  try {
    const weeklySales = await DashboardModel.getWeeklySales();
    success(res, weeklySales, "Weekly Sales Data");
  } catch (error) {
    console.error(error);
    failed(res, "Failed to fetch weekly sales data", error);
  }
}

// Method to get monthly sales data
async getMonthlySales(req, res) {
  try {
    const monthlySales = await DashboardModel.getMonthlySales();
    success(res, monthlySales, "Monthly Sales Data");
  } catch (error) {
    console.error(error);
    failed(res, "Failed to fetch monthly sales data", error);
  }
}
async getYearlySales(req, res) {
  try {
    const yearlySales = await DashboardModel.getYearlySales();
    success(res, yearlySales, "Yearly Sales Data");
  } catch (error) {
    console.error(error);
    failed(res, "Failed to fetch yearly sales data", error);
  }
}

// Remaining methods...
}





module.exports = new DashboardController() 
