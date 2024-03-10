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

    async add_itemset(req, res) {
        try {
            const fields = ["itemset_name", "itemset_detail", "itemset_price", "itemset_qty", "itemset_product_1", "itemset_product_2"];
            let { object, missing } = await check_field(req, fields);
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`);
            } else {
                const newItemset = {
                    itemset_name: object.itemset_name,
                    itemset_detail: object.itemset_detail,
                    itemset_price: object.itemset_price,
                    itemset_qty: object.itemset_qty
                };
                const newItemsetId = await model.addItemset(newItemset);
                const newProduct = {
                    product_name: object.itemset_name,
                    product_detail: object.itemset_detail,
                    product_type_id: 6, 
                    unit_id: 3, 
                    is_active: 1, 
                    itemset_id: newItemsetId 
                };
                const newProductId = await model.addProduct(newProduct);

                const newLotItemset = {
                    add_date: new Date(), 
                    product_lot_cost: object.itemset_price,
                    product_lot_price: object.itemset_price,
                    product_lot_qty: object.itemset_qty,
                    product_id :newProductId
                };
                
                const newLotItemsetID = await model.additemsetlot(newLotItemset);

                const productItemset1 = {
                    product_id: object.itemset_product_1,
                    itemset_id: newItemsetId
                };

                const productItemset2 = {
                    product_id: object.itemset_product_2,
                    itemset_id: newItemsetId
                };
           

                await model.addProductItemset(productItemset1);
                await model.addProductItemset(productItemset2);
                const productLotId = await model.getProductLotWithHighestPrice(productItemset1.product_id);
                const productLotId1 = await model.getProductLotWithHighestPrice(productItemset2.product_id);
                await model.reduceProductLotQuantity(productLotId, newItemset.itemset_qty);
                await model.reduceProductLotQuantity(productLotId1, newItemset.itemset_qty);


                success(res, object, "Add product success!");
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }

    async get_itemset(req, res) {
        try {
            // เรียกใช้งานโมเดลเพื่อดึงข้อมูลชุดสินค้า
            let result = await model.get_itemset();

            // 
            success(res, 'Success get itemset data', result);
        } catch (error) {
            console.log(error);
            // จัดการข้อผิดพลาดหากเกิดขึ้นในขณะดึงข้อมูล
            failed(res, 'Internal Server Error');
        }
    }


}

module.exports = new itemsetController();