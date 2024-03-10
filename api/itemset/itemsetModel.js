const knex = require("../../config/database");

class itemsetModel {
  async getProductDetails(productId) {
    try {
        const result = await knex
            .select(
                "p.product_id",
                "p.product_name",
                "p.product_detail",
                knex.raw("SUM(pl.product_lot_qty) AS total_qty"), // รวมจำนวนสินค้าทั้งหมดจากทุก lot
                knex.raw("SUM(pl.product_lot_cost) AS total_cost"), // รวมราคาทุก lot
                knex.raw("SUM(pl.product_lot_price) AS total_price") // รวมราคาขายทุก lot
            )
            .from("product as p")
            .innerJoin("product_lot as pl", "p.product_id", "pl.product_id")
            .where("p.product_id", productId)
            .andWhere("p.is_active", 1)
            .andWhere("pl.is_active", 1)
            .orderBy("pl.product_lot_price", "desc")
            .groupBy("p.product_id", "p.product_name", "p.product_detail"); // ระบุให้รวมเฉพาะสินค้าเดียวกัน
        return result;
    } catch (error) {
        console.error("Error fetching product details:", error);
        throw error;
    }
}
  

  async getProductLotWithHighestPrice(productId) {
    try {
      const productLot = await knex("product_lot")
        .select("product_lot_id")
        .where("product_id", productId)
        .andWhere("is_active", 1)
        .orderBy("product_lot_price", "desc")
        .first();

      return productLot.product_lot_id;
    } catch (error) {
      console.error("Error fetching product lot with highest price:", error);
      throw error;
    }
  }

  async reduceProductLotQuantity(productLotId, quantity) {
    try {
      await knex("product_lot")
        .where("product_lot_id", productLotId)
        .andWhere("is_active", 1)
        .decrement("product_lot_qty", quantity);
    } catch (error) {
      console.error("Error reducing product lot quantity:", error);
      throw error;
    }
  }

  addItemset(newItemset) {
    return knex("itemset").insert(newItemset);
  }

  addProduct(newProduct) {
    return knex("product").insert(newProduct);
  }

  additemsetlot(newLotItemset) {
    return knex("product_lot").insert(newLotItemset);
  }
  
  get_itemset() {
    return knex("itemset").select().where("is_active", 1);
  }

  addProductItemset(productItemset) {
    return knex("product_itemset").insert(productItemset);
  }
}

module.exports = new itemsetModel();
