const knex = require('../../config/database')

class productModel {

    add_product(data) {
        return knex('product').insert(data)
    }

    update_product_img({ product_id, product_image }) {
        return knex('product').update({ product_image }).where({ product_id })
    }

    update_product(product_id, data) {
        return knex('product').update(data).where({ product_id })
    }

    update_product_active(product_id, is_active) {
        return knex('product').update({ is_active }).where({ product_id })
    }

    // get_product(is_active) {
    //     return knex('product as p').where({ 'p.is_active': is_active })
    //         .leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
    //        // .leftOuterJoin('product as u', 'p.is_active', '=', 'u.is_active')
    // }
    get_product(is_active) {
        return knex('product as p')
            .select('p.product_id', 'p.product_name', 'p.product_detail', 'p.product_cost', 'p.product_price', 'p.product_qty', 'p.product_image', 'p.product_type_id', 'p.unit_id', 'p.is_active', 'pt.product_type')
            .where({ 'p.is_active': is_active })
            .orWhere({ 'p.is_active': 0 })
            .leftJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
            .andWhere(function () {
                this.where('pt.product_type_id', '=', knex.raw('(SELECT pt2.product_type_id FROM product_type pt2 WHERE pt2.product_type_id = p.product_type_id ORDER BY pt2.product_type_id DESC LIMIT 1)'));
            })
            .orderBy('p.product_id', 'asc'); // Order by product_id in ascending order
    }




    get_product_less(number) {
        return knex('product as p').where({ 'p.is_active': 1 }).andWhere('p.product_qty', '<=', number)
        //.leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
        // .leftOuterJoin('unit as u', 'p.unit_id', '=', 'u.unit_id')
    }

    filter_product(status) {
        let query = knex('product as p')
        //.leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
        // .leftOuterJoin('unit as u', 'p.unit_id', '=', 'u.unit_id');

        if (status === 'almost_out_of_stock') {
            query = query.where('p.product_qty', '<=', 50).andWhere('p.product_qty', '>', 0);
        } else if (status === 'ready_to_sell') {
            query = query.where('p.product_qty', '>', 0);
        } else if (status === 'out_of_stock') {
            query = query.where('p.product_qty', 0);
        }

        return query;
    }

    soft_delete_product(product_id) {
        return knex('product').update({ is_active: false }).where({ product_id });
    }

    update_product_qty(product_id, new_qty) {
        return knex('product').update({ product_qty: new_qty }).where({ product_id });
    }
    add_order(data) {
        return knex('order').insert(data);
    }

    add_order_product(data) {
        return knex('order_products').insert(data);
    }
    get_member(memberId) {
        return knex('member')
            .select('member_id', 'member_fname', 'member_lname', 'member_email', 'point', 'is_active', 'member_address', 'member_phone')
            .where({ member_id: memberId })
            .first();
    }

    getOrderById(order_id) {
        return knex
            .select('*')
            .from('order')
            .where('order_id', order_id)
            .first();
    }

    getOrderProducts(order_id) {
        return knex
            .select('opid', 'order_id', 'product_id', 'itemset_id', 'status', 'quantity', 'unit_price', 'cost_price')
            .from('order_products')
            .where('order_id', order_id);
    }
    update_member_point(memberId, newPoint) {
        return knex('member')
            .where({ member_id: memberId })
            .update({ point: newPoint });
    }
    get_promotion(promotionId) {
        return knex('promotion')
            .where('promotion_id', promotionId)
            .select('*')
            .first();
    }
    update_promotion_quota(promotionId, updatedQuota) {
        return knex('promotion')
            .where('promotion_id', promotionId)
            .update({ quota: updatedQuota });

    }
    async return_product(order_product_id) {
        try {
            // 1. ดึงข้อมูล order_product จากฐานข้อมูล
            const orderProduct = await knex('order_products')
                .where({ opid: order_product_id })
                .first()
                .forUpdate(); // Lock the selected row for update
    
            if (!orderProduct) {
                throw new Error('No order product found for the given order product ID');
            }
    
            // 2. ทำการคืนสินค้า (เพิ่มสินค้ากลับไปยังสต็อกหรือทำตามต้องการ)
            // Adjust the logic based on your specific requirements
            // For example, update the product quantity in the 'product' table
            await knex.transaction(async (trx) => {
                await knex('product')
                    .where({ product_id: orderProduct.product_id })
                    .increment('product_qty', orderProduct.quantity)
                    .transacting(trx);
    
                // 3. อัปเดตสถานะ order_product เป็น 'refund' หรือตามที่คุณต้องการ
                await knex('order_products')
                    .update({ status: 'refund' })
                    .where({ opid: order_product_id })
                    .transacting(trx);
    
                // Commit the transaction
                await trx.commit();
            });
    
            // 5. Return success message
            return 'Return product success!';
        } catch (error) {
            console.error('Error returning product:', error);
            // Handle errors or rethrow them
            throw error;
        }
    }
    

    async get_receipt(order_id) {
        try {
            const result = await knex('order')
                .select(
                    'order.order_id',
                    'order.total_amount',
                    'order.point_use',
                    'order.order_date',
                    'order_products.product_id',
                    'order_products.quantity',
                    'order_products.unit_price',
                    'order_products.cost_price',
                    'order.point',
                    'product.product_name',
                    'product.product_detail',
                    'product.product_image',
                    'member.member_fname',
                    'member.member_lname',
                    'unit.unit' // Assuming there is a 'unit' field in the 'unit' table
                )
                .leftJoin('order_products', 'order.order_id', 'order_products.order_id')
                .leftJoin('product', 'order_products.product_id', 'product.product_id')
                .leftJoin('member', 'order.member_id', 'member.member_id') // Join with the member table
                .leftJoin('unit', 'product.unit_id', 'unit.unit_id') // Join with the unit table
                .where('order.order_id', order_id);

            // Replace null values with 0 in the result
            const resultWithDefaultValues = result.map((row) => ({
                ...row,
                total_amount: row.total_amount || 0,
                point_use: row.point_use || 0,
                status: row.status || 0, // Assuming status is part of the result
                member_fname: row.member_fname || "",
                member_lname: row.member_lname || "",
            }));

            return resultWithDefaultValues;
        } catch (error) {
            throw error;
        }
    }
    // Inside productModel.js

    getOrderProductsByOrderId(order_id) {
        return knex('order_products')
            .select('opid', 'order_id', 'product_id', 'itemset_id', 'status', 'quantity', 'unit_price', 'cost_price')
            .where({ order_id });
    }

    get_order_products(order_id) {
        return knex('order_products')
            .select('order_products.opid', 'order_products.product_id', 'order_products.quantity', 'order_products.unit_price', 'order_products.cost_price', 'product.product_name', 'order_products.status', 'order_products.order_id')
            .where('order_products.order_id', order_id)
            .join('product', 'order_products.product_id', 'product.product_id');
    }
    
    
    
}


module.exports = new productModel()



