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
            const fields = ["product_name", "product_detail",  "product_type_id", "unit_id", "product_length", "product_width",]
            let { object, missing } = await check_field(req, fields)
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`)
            } else {
                const dbRes = await model.add_product(object)
                const pid = "P" + String(dbRes[0]).padStart(6, '0');
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

                    const productLotAssociationData ={
                        product_id:dbRes[0],
                        product_lot_id:req.body.product_lot_id
                    };
                // 
                await model.add_product_lot_association(productLotAssociationData);

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
                totalAmountText, // Assuming you have totalAmountText in the request body
                cachedTotalAmountText,
                totalAmount,
                selectedProducts,
                selectedMember,
                selectedPromotionId,
                point,
                discountAmount,
                discountedTotalAmount,
                product_cost
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

            // วนลูปเพื่อปรับปรุงสต็อกสินค้าและเพิ่มรายการสั่งซื้อสินค้า
            for (const product of selectedProducts) {
                const newProductQty = product.product_qty - product.quantity;

                await model.update_product_qty(product.product_lot_id, newProductQty);

                await model.add_order_product({
                    order_id: newOrder[0],
                    product_id: product.product_id,
                    quantity: product.quantity,
                    unit_price: product.unit_price,
                    cost_price: product.product_cost, // ใช้ค่า product_cost ที่ได้รับมา
                    status: 'success',
                });
            }

            // อัปเดตค่า "point" ของสมาชิก
            if (memberId) {
                const member = await model.get_member(memberId);
                const currentPoint = member.point || 0;
                const updatedPoint = currentPoint + point;
                const updatedMember = await model.update_member_point(memberId, updatedPoint);

                if (!updatedMember) {
                    errorMessage = "Failed to update member's point";
                }
            }

            // ลดโปรโมชั่น
            if (promotionId) {
                const promotion = await model.get_promotion(promotionId);
                const currentpromotion = promotion.quota || 0;
                const updatepromotion = currentpromotion - 1;

                const updatePromotionSuccess = await model.update_promotion_quota(promotionId, updatepromotion);
                if (!updatePromotionSuccess) {
                    errorMessage = "Failed to update promotion quota";
                }
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


    get_member(memberId) {
        return knex('member')
            .where('member_id', memberId)
            .select('*')
            .first();
    }

    async getOrderDetails(req, res) {
        try {
            const result = await knex('order')
                .select('order.order_id', 'order.total_amount', 'order.status', 'order.point_use', 'order.order_date', 'order_products.product_id', 'order_products.status as op_status', 'order_products.quantity', 'order_products.unit_price', 'order_products.cost_price')
                .innerJoin('order_products', 'order.order_id', 'order_products.order_id');

            success(res, result, "Order Details");
        } catch (error) {
            console.log(error);
            failed(res, { error: 'Internal Server Error' });
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
    
    async add_lot(req,res){
        try {
            const fields = ["lot_number", "add_date", "product_lot_qty", "product_lot_cost", "product_lot_price"]
            let { object, missing } = await check_field(req, fields)
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`)
            } else {
                const result = await model.add_lot(object)
    
                success(res, result, "Add Lot success!")
            }
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
     }

 async get_lot(req, res) {
    try {
        const result = await model.get_lot()
        success(res, result)
    } catch (error) {
        console.log(error)
        failed(res, 'Internal Server Error')
    }
}

}
module.exports = new productController()
