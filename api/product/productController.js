const model = require('./productModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const { myFs } = require('../..');
const fs = require('fs').promises;
const path = require('path');
const knex = require('../../config/database')
class productController {

    async add_product(req, res) {
        try {
            const fields = ["product_name", "product_detail", "product_type_id", "unit_id", "product_length", "product_width", "product_thickness"]
            let { object, missing } = await check_field(req, fields)
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`)
            } else {
                const dbRes = await model.add_product(object)
                const pid = "PID" + String(dbRes[0]).padStart(6, '0');
                if (req.file) {
                    const oldPath = `static/product/${req.file.filename}`;
                    const newPath = `static/product/${pid}${path.extname(oldPath)}`;
                    object = { product_id: dbRes[0], pid, ...object }
                    fs.rename(oldPath, newPath, function (err) {
                        if (err) throw err;
                        console.log('File renamed successfully!');
                    });
                    await model.update_product_img({ product_id: dbRes[0], product_image: newPath })
                }
                success(res, object, "Add product success!")
            }
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

    async update_product(req, res) {
        try {
            const { product_id } = req.body
            let object = req.body
            delete object.product_id
            if (!product_id) {
                failed(res, `Column "product_id" is missing!`)
            } else {
                const pid = "PID" + String(product_id).padStart(6, '0')
                if (req.file) {
                    const oldPath = `static/product/${req.file.filename}`;
                    const newPath = `static/product/${pid}.jpg`;
                    myFs.unlink(newPath, (err) => {
                        if (err) throw err;
                        console.log('File has been deleted');
                    });
                    myFs.rename(oldPath, newPath, function (err) {
                        if (err) throw err;
                        console.log('File renamed successfully!');
                    });
                    object = { ...object, product_image: newPath }
                }
                await model.update_product(product_id, object)
                success(res, object, "Update product success!")
            }
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

    // async update_product(req, res) {
    //     try {
    //         const { product_id } = req.body
    //         let object = req.body
    //         delete object.product_id
    //         if (!product_id) {
    //             failed(res, `Column "product_id" is missing!`)
    //         } else {
    //             const pid = "PID" + String(product_id).padStart(6, '0')
    //             if (req.file) {
    //                 const oldPath = `static/product/${req.file.filename}`;
    //                 const newPath = `static/product/${pid}.jpg`;
    //                 myFs.unlink(newPath, (err) => {
    //                     if (err) throw err;
    //                     console.log('File has been deleted');
    //                 });
    //                 myFs.rename(oldPath, newPath, function (err) {
    //                     if (err) throw err;
    //                     console.log('File renamed successfully!');
    //                 });
    //                 object = { ...object, product_image: newPath }
    //             }
    //             await model.update_product(product_id, object)
    //             success(res, object, "Update product success!")
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         failed(res, 'Internal Server Error')
    //     }
    // }

    async active_product(req, res) {
        try {
            const { product_id, is_active } = req.body;
            if (!product_id || typeof is_active === 'undefined') { // เพิ่มตรวจสอบ typeof is_active
                failed(res, `Column "product_id" or "is_active" is missing!`);
            } else {
                // แก้ไขโค้ดใน model.update_product_active เพื่อทำ Soft Delete โดยเพิ่มการตรวจสอบค่า is_active
                if (is_active === false) {
                    await model.soft_delete_product(product_id);
                } else {
                    await model.update_product_active(product_id, is_active);
                }
                success(res, req.body, "Product status changed!");
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }


    async get_product_sales(req, res) {
        try {
            const { status } = req.query;
            let result = [];

            if (status === 'deleted') {
                result = await model.get_product(0); // ดึงสินค้าที่ถูกลบ
            } else if (status === 'active') {
                result = await model.get_product(1); // ดึงสินค้าที่ใช้งาน
            } else if (status === 'almost') {
                result = await model.get_product_less(100); // ดึงสินค้าที่ใกล้หมด (เปลี่ยนจาก 50 เป็น 100)
            } else if (status === 'oos') {
                result = await model.get_product_less(1); // ดึงสินค้าที่หมด
            } else {
                // ค่าเริ่มต้น: ดึงสินค้าที่ใช้งาน
                result = await model.get_product_sales(1);
            }
            //result = result.filter(e => e.is_active > 0); // Filter products with quantity greater than 0
            //  result = result.filter(e => e.product_qty > 0); // Filter products with quantity greater than 0

            success(res, result, "Product list");
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }


    async get_product(req, res) {
        try {
            const { status } = req.query;
            let result = [];

            if (status === 'deleted') {
                result = await model.get_product(0); // ดึงสินค้าที่ถูกลบ
            } else if (status === 'active') {
                result = await model.get_product(1); // ดึงสินค้าที่ใช้งาน
            } else if (status === 'almost') {
                result = await model.get_product_less(100); // ดึงสินค้าที่ใกล้หมด (เปลี่ยนจาก 50 เป็น 100)
            } else if (status === 'oos') {
                result = await model.get_product_less(1); // ดึงสินค้าที่หมด
            } else {
                // ค่าเริ่มต้น: ดึงสินค้าที่ใช้งาน
                result = await model.get_product(1);
            }
            //result = result.filter(e => e.is_active > 0); // Filter products with quantity greater than 0
            //  result = result.filter(e => e.product_qty > 0); // Filter products with quantity greater than 0

            success(res, result, "Product list");
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }


    async filter_product(req, res) {
        try {
            const { status } = req.query;
            let result = [];

            switch (status) {
                case 'low_stock':
                    result = await model.get_product_less(50);
                    break;
                case 'in_stock':
                    result = await model.get_product(1);
                    break;
                case 'out_of_stock':
                    result = await model.get_product_less(0);
                    break;
                case 'deleted': // เพิ่มเงื่อนไขในการแสดงสินค้าที่ถูกลบ
                    result = await model.get_product(0);
                    break;
                default:
                    result = await model.get_product(1);
            }

            result = result.filter(e => e.product_qty > 0 && e.is_active === 1);

            success(res, result, 'Filtered product list');
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }

    async confirm_order(req, res) {
        try {
            const {
                totalAmountText,
                cachedTotalAmountText,
                totalAmount,
                selectedProducts,
                selectedMember,
                selectedPromotionId,
                point,
                discountAmount,
                discountedTotalAmount,
                totalAmountWithGlassCost,
                product_cost,
                calculatedCost, calculatedCostalu, totalAmountWithAluminumCost,
                itemset_id,


                userId // เพิ่ม userId จาก frontend
            } = req.body;

            if (!totalAmount || !selectedProducts || !point) {
                return failed(res, "Invalid input data");
            }

            const memberId = selectedMember || null;
            const promotionId = selectedPromotionId || null;

            let successMessage = "Order confirmed successfully";
            let errorMessage = "Error confirming order";

            const newOrder = await model.add_order({
                total_amount: totalAmountText,
                member_id: memberId,
                promotion_id: promotionId,
                point: point,
                discountAmount: discountAmount,
                discountedTotalAmount: discountedTotalAmount,
                status: 'success',
            });

            for (const product of selectedProducts) {
                // Assuming a function that gets product details including its category.
                const productDetails = await model.get_full_product_details_by_product_id(product.product_id);

                const productLots = await model.get_product_lots_by_product_id(product.product_id);
                productLots.sort((a, b) => new Date(a.add_date) - new Date(b.add_date));

                const productItemset3 = await model.get_itemset_by_itemset_id(product.itemset_id);
                console.log(productItemset3.itemset_qty)
                let id_item_qty = productItemset3.itemset_qty

                //productItemset3.sort((a, b) => new Date(a.add_date) - new Date(b.add_date));

                let id_item = product.itemset_id;

                let remainingQuantity = product.quantity;
                let lotUsageDetails = [];
                let sale_price = product.unit_price;

                for (const lot of productLots) {
                    let lotQuantityToUse = Math.min(lot.product_lot_qty, remainingQuantity);
                    let unit_price, product_cost;
                    let datasetDetail = productDetails.product_id;

                    if (product.itemset_id = 0) {
                        if (productDetails.product_type === 'กระจก') {
                            if (totalAmountWithGlassCost >= lot.product_lot_cost) {
                                unit_price = product.calculatedCost; // Calculated elsewhere.
                                //product_cost = totalAmountWithGlassCost; // Assume same as price or adjust accordingly.
                                product_cost = lot.product_lot_cost; // Assume same as price or adjust accordingly.
                            }
                            else {
                                unit_price = totalAmountWithGlassCost; // Calculated elsewhere.
                                product_cost = totalAmountWithGlassCost; // Assume same as price or adjust accordingly.
                            }


                        } else if (productDetails.product_type === 'อลูมิเนียม') {
                            // For aluminum, using the calculatedCostalu specific to aluminum.
                            if (totalAmountWithAluminumCost >= lot.product_lot_cost) {
                                unit_price = product.calculatedCostalu; // Use calculatedCostalu for aluminum.
                                product_cost = lot.product_lot_cost;
                            } else {
                                unit_price = totalAmountWithAluminumCost; // If total amount with glass cost is less, use it.
                                product_cost = totalAmountWithAluminumCost;
                            }
                        } else {
                            // Default pricing for other categories
                            unit_price = sale_price;
                            product_cost = lot.product_lot_cost;
                        }
                        await model.update_product_lot_quantity(lot.product_lot_id, lot.product_lot_qty - lotQuantityToUse);

                        // Record lot usage details
                        lotUsageDetails.push({
                            product_lot_id: lot.product_lot_id,
                            used_quantity: lotQuantityToUse,
                            unit_price,
                            product_cost
                        });

                    } else {

                        console.log(id_item)
                        for (const itemset of productItemset3) {



                            await model.update_itemset_quantity(id_item, itemset.itemset_qty - lotQuantityToUse);
                        }





                        if (productDetails.product_type === 'กระจก') {
                            if (totalAmountWithGlassCost >= lot.product_lot_cost) {
                                unit_price = product.calculatedCost; // Calculated elsewhere.
                                //product_cost = totalAmountWithGlassCost; // Assume same as price or adjust accordingly.
                                product_cost = lot.product_lot_cost; // Assume same as price or adjust accordingly.
                            }
                            else {
                                unit_price = totalAmountWithGlassCost; // Calculated elsewhere.
                                product_cost = totalAmountWithGlassCost; // Assume same as price or adjust accordingly.
                            }


                        } else if (productDetails.product_type === 'อลูมิเนียม') {
                            // For aluminum, using the calculatedCostalu specific to aluminum.
                            if (totalAmountWithAluminumCost >= lot.product_lot_cost) {
                                unit_price = product.calculatedCostalu; // Use calculatedCostalu for aluminum.
                                product_cost = lot.product_lot_cost;
                            } else {
                                unit_price = totalAmountWithAluminumCost; // If total amount with glass cost is less, use it.
                                product_cost = totalAmountWithAluminumCost;
                            }
                        } else {
                            // Default pricing for other categories
                            unit_price = sale_price;
                            product_cost = lot.product_lot_cost;
                        }
                        await model.update_product_lot_quantity(lot.product_lot_id, lot.product_lot_qty - lotQuantityToUse);

                        // Record lot usage details
                        lotUsageDetails.push({
                            product_lot_id: lot.product_lot_id,
                            used_quantity: lotQuantityToUse,
                            unit_price,
                            product_cost
                        });
                    }



                    // Add stock transaction for this lot
                    await model.add_stock_transaction({
                        product_id: product.product_id,
                        product_lot_id: lot.product_lot_id,
                        quantity: lotQuantityToUse,
                        transaction_date: new Date(),
                        status: 'sales',
                        seller_id: userId
                    });

                    remainingQuantity -= lotQuantityToUse;
                    if (remainingQuantity <= 0) break; // Exit the loop if order quantity is fully allocated
                }

                // Add order product details for each used lot
                for (const detail of lotUsageDetails) {
                    await model.add_order_product({
                        order_id: newOrder[0],
                        product_id: product.product_id,
                        quantity: detail.used_quantity,
                        unit_price: detail.unit_price, // Use the specific lot's unit price
                        cost_price: detail.product_cost, // Use the specific lot's cost price
                        status: 'success',
                        product_lot_id: detail.product_lot_id
                    });
                }
            }

            // Update member's point
            if (memberId) {
                const member = await model.get_member(memberId);
                const currentPoint = member.point || 0;
                const updatedPoint = currentPoint + point;
                await model.update_member_point(memberId, updatedPoint);
            }

            // Reduce promotion quota
            if (promotionId) {
                const promotion = await model.get_promotion(promotionId);
                const currentPromotionQuota = promotion.quota || 0;
                const updatedPromotionQuota = currentPromotionQuota - 1;
                await model.update_promotion_quota(promotionId, updatedPromotionQuota);
            }

            if (errorMessage === "Error confirming order") {
                return success(res, newOrder, successMessage);
            } else {
                return failed(res, errorMessage);
            }
        } catch (error) {
            console.error(error);
            failed(res, "Error confirming order");
        }
    }

    async delete_lot(req, res) {
        try {
            const { lotId } = req.body; // Assume lotId is passed as a URL parameter
            if (!lotId) {
                return res.status(400).json({ success: false, message: 'Lot ID is missing' });
            }

            const result = await model.delete_lot(lotId);
            if (result) {
                return res.json({ success: true, message: 'Product lot successfully deleted' });
            } else {
                return res.status(404).json({ success: false, message: 'Product lot not found' });
            }
        } catch (error) {
            console.error('Error deleting product lot:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }



    get_member(memberId) {
        return knex('member')
            .where('member_id', memberId)
            .select('*')
            .first();
    }
    async getOrderDetails(req, res) {
        try {
            const orders = await knex("order")
                .select(
                    "order.order_id",
                    "order.total_amount",
                    "order.status",
                    "order.point_use",
                    "order.order_date",
                    "order_products.product_id",
                    "order_products.status as op_status",
                    "order_products.unit_price",
                    "order_products.cost_price"
                )
                .leftJoin("order_products", "order.order_id", "order_products.order_id")
                .orderBy("order.order_id");

            const orderDetails = orders.reduce((acc, order) => {
                const existingOrder = acc.find(
                    (item) => item.order_id === order.order_id
                );
                if (existingOrder) {
                    existingOrder.order_products.push({
                        product_id: order.product_id,
                        op_status: order.op_status,
                        unit_price: order.unit_price,
                        cost_price: order.cost_price,
                    });
                    // เพิ่มจำนวนสินค้าของแต่ละรายการสั่งซื้อ
                    existingOrder.total_quantity = existingOrder.order_products.reduce(
                        (total, product) => total + 1,
                        0
                    );
                } else {
                    acc.push({
                        order_id: order.order_id,
                        total_amount: order.total_amount,
                        total_quantity: 1, // รายการแรกจะมีจำนวนสินค้าเป็น 1 เนื่องจากมีสินค้าใน order
                        status: order.status,
                        point_use: order.point_use,
                        order_date: order.order_date,
                        order_products: [
                            {
                                product_id: order.product_id,
                                op_status: order.op_status,
                                unit_price: order.unit_price,
                                cost_price: order.cost_price,
                            },
                        ],
                    });
                }
                return acc;
            }, []);

            success(res, orderDetails, "Order Details");
        } catch (error) {
            console.log(error);
            failed(res, { error: "Internal Server Error" });
        }
    }
    async return_product(req, res) {
        try {
            const { opid } = req.body;

            if (!opid) {
                failed(res, 'Column "opid" is missing!');
            } else {
                // Assuming you have a model method for handling return products
                const returnResult = await model.return_product(opid);

                if (returnResult) {
                    success(res, returnResult, 'Return product success!');
                } else {
                    failed(res, 'Failed to return product');
                }
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }


    async get_receipt(req, res) {
        try {
            const { order_id } = req.params; // การดึงค่า order_id จากพารามิเตอร์ URL
            if (!order_id) {
                failed(res, 'Column "order_id" is missing!');
            } else {
                const result = await model.get_receipt(order_id);
                if (result) {
                    success(res, result, 'Receipt details retrieved successfully!');
                } else {
                    failed(res, 'Receipt details not found');
                }
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }

    async get_receiptrefund(req, res) {
        try {
            const { order_id } = req.params; // การดึงค่า order_id จากพารามิเตอร์ URL
            if (!order_id) {
                failed(res, 'Column "order_id" is missing!');
            } else {
                const result = await model.get_receiptrefund(order_id);
                if (result) {
                    success(res, result, 'Receipt details retrieved successfully!');
                } else {
                    failed(res, 'Receipt details not found');
                }
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }


    // Inside productController.js

    async getorder_product(req, res) {
        try {
            const { order_id } = req.params;
            if (!order_id) {
                return failed(res, 'Column "order_id" is missing!');
            }

            // Use the order_id to fetch order products from the database
            const orderProducts = await model.get_order_products(order_id);

            if (orderProducts) {
                return success(res, orderProducts, 'Order products retrieved successfully!');
            } else {
                return failed(res, 'Order products not found');
            }
        } catch (error) {
            console.error(error);
            return failed(res, 'Internal Server Error');
        }
    }
    async getPurchaseHistoryByMember(req, res) {
        try {
            const { memberId } = req.params;

            if (!memberId) {
                return failed(res, 'Member ID is missing');
            }

            const purchaseHistory = await model.getPurchaseHistoryByMember(memberId);

            if (purchaseHistory.length > 0) {
                return success(res, purchaseHistory, 'Purchase history retrieved successfully');
            } else {
                return failed(res, 'Purchase history not found for the member');
            }
        } catch (error) {
            console.error(error);
            failed(res, 'Internal Server Error');
        }
    }
    async getPurchaseHistoryDetailByOrderID(req, res) {
        try {
            const { orderID } = req.params;

            if (!orderID) {
                return failed(res, 'Order ID is missing');
            }

            const purchaseHistory = await model.getPurchaseHistoryByOrderID(orderID);

            if (purchaseHistory.length > 0) {
                return success(res, purchaseHistory, 'Purchase history retrieved successfully');
            } else {
                return failed(res, 'Purchase history not found for the order');
            }
        } catch (error) {
            console.error(error);
            failed(res, 'Internal Server Error');
        }
    }

    async add_lot(req, res) {
        try {
            const fields = ["add_date", "product_lot_qty", "product_lot_cost", "product_lot_price", "product_id"];
            let { object, missing } = await check_field(req, fields);
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`);
            } else {
                // เพิ่มข้อมูลลงในตาราง product_lot
                const productLotResult = await model.add_lot(object);

                if (productLotResult) {
                    // เพิ่มข้อมูลลงในตาราง stock_transaction
                    const stockTransactionObject = {
                        product_id: object.product_id,
                        quantity: object.product_lot_qty,
                        transaction_date: object.add_date,
                        status: 'added', // สถานะการทำธุรกรรมเพิ่มสต็อก
                        product_lot_id: productLotResult.product_lot_id // บันทึก product_lot_id
                    };

                    console.log('Stock Transaction Object:', stockTransactionObject); // เพิ่มบรรทัดนี้เพื่อดูข้อมูลของ Object ก่อนที่จะทำการเพิ่มเข้าใน stock_transaction

                    const stockTransactionResult = await model.add_stock_transaction(stockTransactionObject);

                    success(res, { productLotResult, stockTransactionResult }, "Add Lot success!");
                } else {
                    failed(res, 'Failed to add data to product_lot');
                }
            }
        } catch (error) {
            console.log(error); // เพิ่มบรรทัดนี้เพื่อดูข้อผิดพลาดที่เกิดขึ้นใน catch block
            failed(res, 'Internal Server Error');
        }
    }





    async update_lot(req, res) {
        try {
            const fields = ["add_date", "product_lot_qty", "product_lot_cost", "product_lot_price"];
            const { lotId } = req.params;
            let { object, missing } = await check_field(req, fields);

            if (missing.length > 0) {
                failed(res, `Column(s) "${missing.join(', ')}" is missing!`);
            } else {
                // เรียกใช้ model.update_lot ด้วย id ที่ได้รับ
                const result = await model.update_lot(lotId, object);
                success(res, result, "Update Lot success!");
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }







    async get_lot(req, res) {
        try {
            const { product_id } = req.body; // หรือ req.params หรือ req.query ตามวิธีการส่งข้อมูลในคำขอของคุณ
            const result = await model.get_lot(product_id);
            success(res, result);
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }


    async get_lot_all(req, res) {
        try {
            const result = await model.get_lot_sum(); // Make sure to call the method
            success(res, result);
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }

}
module.exports = new productController()
