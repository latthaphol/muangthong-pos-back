const knex = require("../../config/database");

class itemsetModel {
  async update_itemset_img({ itemset_id, image_itemset }) {
    try {
        const result = await knex('itemset')
            .where({ itemset_id })
            .update({ image_itemset }); 
        return result; // ผลลัพธ์สามารถเป็นจำนวนแถวที่ได้รับผลกระทบ
    } catch (error) {
        console.error("Error updating item set image:", error);
        throw error; // โยนข้อผิดพลาดเพื่อให้ระบบจัดการ
    }
}
update_product_img({ product_id, product_image }) {
  return knex('product').update({ product_image }).where({ product_id })
}
// update_product_qty(product_lot_id, itemset_qty) {
//   return knex('product_lot')
//       .update({ product_lot_qty: itemset_qty })
//       .where({ product_lot_id: product_lot_id });
// }

async updateItemset({ itemset_id, itemset_name, itemset_detail, itemset_price, itemset_qty }) {
  try {
      await knex('itemset')
          .where({ itemset_id })
          .update({
              itemset_name,
              itemset_detail,
              itemset_price,
              itemset_qty
          });
//           update_product_qty(product_id, itemset_qty) {
//           //หาproduct_id ที่ตรงกับitemset_id  แล้วไปที่ product_lot ต่อเพื่อนำitemset_qty ไปใส่ที่ product_lot_qty: itemset_qty
//   return knex('product_lot')
//       .update({ product_lot_qty: itemset_qty })
//       .where({ product_lot_id: product_lot_id });
// }

      return true;
  } catch (error) {
      console.error("Error updating item set in the database:", error);
      throw error;
  }
}

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
  
  product_itemset(product_itemset) {
    return knex("product_itemset").insert(product_itemset);
  }
  // get_itemset() {
  //   return knex("itemset").select().where("is_active", 1);
  // }

  addProductItemset(productItemset) {
    return knex("product_itemset").insert(productItemset);
  }
  get_product_id_by_itemset_id(itemset_id) {
    return knex('product_itemset')
    .select(
        'product_id',
    )
        .where({ itemset_id: itemset_id}) // Assuming you want to include only active lots
} 
  get_product_lots_by_product_id(product_id) {
  return knex('product_lot')
      .where({ product_id: product_id, is_active: 1 }) // Assuming you want to include only active lots
      .orderBy('add_date', 'asc'); // Sort by add_date to prioritize older lots
}
update_product_({product_id, itemset_name, itemset_detail}) {
  return knex('product')
      .where({ product_id: product_id, is_active: 1 })
      .update({ 
          product_name: itemset_name,
          product_detail: itemset_detail,
      });
}
async  get_itemset() {
  // อัพเดท is_active เป็น 0 สำหรับ itemset_qty ที่มีค่าน้อยกว่าหรือเท่ากับ 0
  await knex("itemset").where("itemset_qty", "<=", 0).update("is_active", 0);

  // เลือกข้อมูล itemset ที่ is_active เป็น 1
  const itemsets = await knex("itemset").select().where("is_active", 1);
  
  return itemsets;
}

async  get_products_with_matching_itemsets() {
  // รับข้อมูล itemset ที่ผ่านการกรองแล้ว
  const itemsets = await get_itemset();
  
  // สร้าง array ของ itemset_id จาก itemsets
  const itemsetIds = itemsets.map(itemset => itemset.itemset_id);
  
  // เลือกข้อมูล product ที่มี itemset_id ตรงกับ itemsetIds
  const products = await knex("product").select().whereIn("itemset_id", itemsetIds);
  
  return products;
}
async deactivateItemset(itemsetId) {
  try {
    const result = await knex('itemset')
      .where('itemset_id', itemsetId)
      .update({ is_active: 0 });
    return result === 1; // คืนค่า true ถ้ามีการอัพเดทเรียบร้อย
  } catch (error) {
    console.error("Error deactivating itemset in the database:", error);
    throw error;
  }
}
get_product_lots_by_product_id2(itemset_id,) {
  return knex('product')
      .where({ itemset_id: itemset_id }) 
}

update_product_lot_quantity2(product_lot_id, newQuantity) {
  return knex('product_lot')
      .where({ product_lot_id: product_lot_id })
      .update({ product_lot_qty: newQuantity });
}
update_product_lot_quantity3(product_lot_id, itemset_qty,itemset_price) {
  return knex('product_lot')
      .where({ product_lot_id: product_lot_id })
      .update({ product_lot_qty: itemset_qty ,
        product_lot_price:itemset_price});
}

get_itemset_by_itemset_id(itemset_id) {
  return knex("itemset").select('itemset_qty',).where({ itemset_id: itemset_id});
}
}

module.exports = new itemsetModel()
