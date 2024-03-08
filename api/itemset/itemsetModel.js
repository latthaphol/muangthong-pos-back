const knex = require("../../config/database");

class itemsetModel {
  async getProductDetails(productId) {
    try {
      const productDetails = await knex("product")
        .select(
          "product.product_id",
          "product.product_name",
          "product.product_detail",
          "product.product_image",
          "product.product_type_id",
          "product.product_width",
          "product.product_length",
          "product.product_thickness",
          "product.unit_id",
          "product.is_active",
          "product_lot.product_lot_qty",
          "product_lot.product_lot_cost",
          "product_lot.product_lot_price",
          knex.raw(
            "(SELECT MIN(add_date) FROM product_lot WHERE product_lot.product_id = product.product_id AND product_lot.is_active = ?) as lot_add_date",
            [1]
          )
        )
        .leftJoin(
          "product_lot",
          "product.product_id",
          "=",
          "product_lot.product_id"
        )
        .where("product.product_id", productId)
        .andWhere("product.is_active", 1)
        .andWhere("product_lot.is_active", 1)
        .groupBy("product.product_id")
        .having(knex.raw("COUNT(product_lot.product_id) > 0"))
        .first();

      return productDetails;
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw error;
    }
  }

  addItemset(newItemset) {
    return knex("itemset").insert(newItemset);
  }

  get_itemset() {
    return knex("itemset").select().where("is_active", 1);
  }


  addProductItemset(productItemset) {
    return knex("product_itemset").insert(productItemset);
  }
  
}

module.exports = new itemsetModel();
