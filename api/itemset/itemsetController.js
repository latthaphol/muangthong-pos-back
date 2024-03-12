
const model = require('./itemsetModel');
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
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

    async update_itemset(req, res) {
        try {

            const itemsetId2 = req.params.itemset_id;
            const productIdItemset = await model.get_product_id_by_itemset_id(itemsetId2);
            console.log('productIdItemset', productIdItemset);

            const c = await model.get_itemset_by_itemset_id(itemsetId2)
            const x = req.body.itemset_qty;

            console.log('cคือ', c);
            let bbb = req.body.itemset_qty
            console.log('bbbคิออะไร' + bbb);


            for (const cc of c) {
                var newqty = x - cc.itemset_qty
                var name = cc.itemset_name
                var detail = cc.itemset_detail
                console.log('newqtyคือ', newqty);

                console.log('name', name);
                console.log('newqtyคือ', detail);



            }

            for (const productIdItem of productIdItemset) {
                console.log('คือ' + productIdItem.product_id)
                const y = await model.get_product_lots_by_product_id(productIdItem.product_id)
                const iteamid = await model.get_product_lots_by_product_id(productIdItem.product_id)
                console.log('iteamid' + iteamid)

                for (const yy of y) {
                    // console.log('qty',yy.product_lot_qty)
                    // console.log('lot_id',yy.product_lot_id)
                    let a = yy.product_lot_id
                    console.log('เท่าไหร่' + a);
                    if (yy.product_lot_qty < newqty) {
                        console.log('yy.product_lot_qty' + yy.product_lot_qty);

                        console.log('สินค้าไม่เพียงพอ');

                        res.status(400).json({ data: 'สินค้าไม่เพียงพอ' })
                        return;
                    }
                    else if (yy.product_lot_qty >= newqty) {
                        //console.log(yy.product_lot_qty - newqty);
                        await model.update_product_lot_quantity2(yy.product_lot_id, yy.product_lot_qty - newqty);
                        //console.log('qty',yy.product_lot_qty)
                        const d = await model.get_product_lots_by_product_id2(itemsetId2);
                        for (const dd of d) {
                            var proitem = dd.product_id;
                            console.log('newqtyคือ', proitem);
                        }

                        const proidArray = await model.get_product_lots_by_product_id(proitem);

                        for (const product of proidArray) {
                            console.log('bproductb' + product);
                            const { itemset_name, itemset_detail, itemset_price } = req.body;
                            console.log('product.product_iditemset_name,itemset_detail', product.product_id,itemset_name,itemset_detail,);

                            const productLots = await model.get_product_lots_by_product_id(product.product_id); // Use product.product_id here
                            console.log('productLots', product.product_id);


                            await model.update_product_({product_id:product.product_id,
                                itemset_name: itemset_name,
                                itemset_detail: itemset_detail,
                            });

                            for (const lot of productLots) {
                                await model.update_product_lot_quantity3(lot.product_lot_id, bbb,itemset_price);
                            }
                        }
                        break;
                    }

                }

            }

            const itemsetId = req.params.itemset_id;
            const { itemset_name, itemset_detail, itemset_price, itemset_qty } = req.body;
            let bb = req.body.itemset_qty
            console.log('คิออะไร' + bb);

            await model.updateItemset({
                itemset_id: itemsetId,
                itemset_name: itemset_name,
                itemset_detail: itemset_detail,
                itemset_price: itemset_price,
                itemset_qty: bb
            });

            return res.status(200).json({
                success: true,
                message: 'Item set updated successfully'
            });
        } catch (error) {
            console.error("Error updating item set:", error);
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
                    itemset_id: newItemsetId,

                };
                const newProductId = await model.addProduct(newProduct);
                const pid = "PID" + String(newProductId[0]).padStart(6, '0');

                if (req.file) {
                    const imageUrl = `/uploads/${req.file.filename}`; // Construct the URL path for the uploaded image
                    const oldPath = path.join('static', 'product', req.file.filename);
                    const newPath = path.join('static', 'product', `${pid}${path.extname(oldPath)}`);
                    await model.update_itemset_img({ itemset_id: newItemsetId, image_itemset: newPath });
                    await model.update_product_img({ product_id: newProductId, product_image: newPath });

                    console.log(imageUrl);
                    await fs.rename(oldPath, newPath);
                    console.log('File renamed successfully!');
                }
                // if (req.file) {
                //     const imageUrl = `/uploads/${req.file.filename}`; // Construct the URL path for the uploaded image
                //     const oldPath = path.join('static', 'product', req.file.filename);
                //     const newPath = path.join('static', 'product', `${pid}${path.extname(oldPath)}`);
                //     await model.update_product_img({ product_id: newProductId, product_image: newPath });
                //     console.log(imageUrl);
                //     console.log('File renamed successfully!');
                // }

                const newLotItemset = {
                    add_date: new Date(),
                    product_lot_cost: object.itemset_price,
                    product_lot_price: object.itemset_price,
                    product_lot_qty: object.itemset_qty,
                    product_id: newProductId
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



                // const product_itemsetID = await model.product_itemset(product_itemset1);
                // const product_itemsetID1 = await model.product_itemset(product_itemset2);

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
