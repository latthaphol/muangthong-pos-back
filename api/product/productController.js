const model = require('./productModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const { myFs } = require('../..');
const fs = require('fs').promises;
const path = require('path');
const knex = require('../../config/database')
class productController {

    // async add_product(req, res) {
    //     try {
    //       const fields = ["product_name", "product_detail", "product_cost", "product_price", "product_qty", "product_type_id", "unit_id"];
    //       const product = await check_field(req, fields);

    //       if (product === null) {
    //         return failed(res, "Missing required fields");
    //       }

    //       const dbRes = await model.add_product(product);
    //       const pid = "P" + String(dbRes[0]).padStart(6, '0');

    //       if (req.file) {
    //         const oldPath = `static/product/${req.file.filename}`;
    //         const newPath = `static/product/${pid}.jpg`;

    //         product = { ...product, product_id: dbRes[0], pid };
    //         myFs.rename(oldPath, newPath, function (err) {
    //           if (err) throw err;
    //           console.log('File renamed successfully!');
    //         });
    //         await model.update_product_img({ product_id: dbRes[0], product_image: newPath });
    //       }

    //       return success(res, product, "Add product success!");
    //     } catch (error) {
    //       console.log(error);
    //       return failed(res, "Internal Server Error");
    //     }
    //   }


    async add_product(req, res) {
        try {
            const fields = ["product_name", "product_detail", "product_cost", "product_price", "product_qty", "product_type_id", "unit_id"]
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
                totalAmount,
                selectedProducts,
                selectedMember,
                selectedPromotionId,
                point,
                discountAmount,
                discountedTotalAmount,
            } = req.body;
    
            if (!totalAmount || !selectedProducts || !point) {
                return failed(res, "Invalid input data");
            }
    
            const memberId = selectedMember || null;
            const promotionId = selectedPromotionId || null;
    
            let successMessage = "Order confirmed successfully";
            let errorMessage = "Error confirming order";
    
            const newOrder = await model.add_order({
                total_amount: totalAmount,
                member_id: memberId,
                promotion_id: promotionId,
                point: point,
                discountAmount: discountAmount,
                discountedTotalAmount: discountedTotalAmount,
            });
    
            // วนลูปเพื่อปรับปรุงสต็อกสินค้าและเพิ่มรายการสั่งซื้อสินค้า
            for (const product of selectedProducts) {
                const newProductQty = product.product_qty - product.quantity;
    
                await model.update_product_qty(product.product_id, newProductQty);
    
                await model.add_order_product({
                    order_id: newOrder[0],
                    product_id: product.product_id,
                    quantity: product.quantity,
                    unit_price: product.unit_price,
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
                .select('order.order_id', 'order.member_id', 'order.promotion_id', 'order.point', 'order.total_amount', 'order.status', 'order.point_use', 'order.order_date', 'order_products.opid', 'order_products.product_id', 'order_products.itemset_id', 'order_products.status as op_status', 'order_products.quantity', 'order_products.unit_price', 'order_products.cost_price')
                .innerJoin('order_products', 'order.order_id', 'order_products.order_id');

            success(res, result, "Order Details");
        } catch (error) {
            console.log(error);
            failed(res, { error: 'Internal Server Error' });
        }
    }







}
module.exports = new productController()







