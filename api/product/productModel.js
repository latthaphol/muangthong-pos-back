const knex = require('../../config/database')

class productModel {

    add_product(data) {
        return knex('product').insert(data)
    }
    async add_lot(data) {
        try {
            const result = await knex('product_lot').insert(data);
            const product_lot_id = result[0]; // Assuming the ID is returned as the first element of the array
            return { product_lot_id };
        } catch (error) {
            throw error;
        }
    }
    
    update_product_img({ product_id, product_image }) {
        return knex('product').update({ product_image }).where({ product_id })
    }
    add_product_lot_association(data) {
        return knex('product_lot_association').insert(data);
    }
    add_stock_transaction(data){
        return knex('stock_transaction').insert(data);
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
    get_product() {
        return knex('product as p')
            .leftJoin('product_lot as pl', 'p.product_id', 'pl.product_id')
            .leftJoin('product_type as pt', 'p.product_type_id', 'pt.product_type_id') // Join with product_type table
            .select(
                'p.product_id',
                'p.product_name',
                'p.product_detail',
                'p.product_image',
                'p.product_type_id',
                'p.product_width',
                'p.product_length',
                'p.product_thickness',
                'p.unit_id',
                'p.is_active',
                'pt.product_type', // Select the product type name
                knex.raw('COALESCE(SUM(pl.product_lot_qty), 0) as total_quantity')
            )
            .where('p.is_active', 1)
            .groupBy('p.product_id', 'p.product_name', 'p.product_detail', 'p.product_image', 'p.product_type_id', 'p.product_width', 'p.product_length', 'p.product_thickness', 'p.unit_id', 'p.is_active', 'pt.product_type') // Include product type in groupBy
            .orderBy('p.product_id', 'asc');
    }
    
    get_product_type_id() {
        return knex('product as p')
            .leftJoin('product_type as pt', 'p.product_type_id', 'pt.product_type_id')
            .select(
                'p.product_type_id', // Select the product type id
                'pt.product_type' // Select the product type name
            )
            .where('p.is_active', 1) // Add condition that only active items are selected
            .groupBy('p.product_type_id', 'pt.product_type') // Group by product type id and name
            .orderBy('p.product_type_id', 'asc'); // Order by product type id
    }
    
    async delete_lot(lotId) {
        try {
            const result = await knex('product_lot')
                .where({ product_lot_id: lotId })
                .update({ is_active: 0 });
            return result;
        } catch (error) {
            console.error('Error in deleting product lot:', error);
            throw error;
        }
    }
    

    updateGlassProductDetails(product_id, dimensions, cutCost) {
        return knex('glass_product_details').update({ dimensions, cut_cost: cutCost }).where({ product_id });
    }

    // Method to add new glass product details
    addGlassProductDetails(data) {
        return knex('glass_product_details').insert(data);
    }


    get_product_sales = (is_active) => {
        return knex.transaction(async (trx) => {
            try {
                // Retrieve product data including the old data and related lot data excluding lots with is_active = 0
                const productData = await trx('product as p')
                    .leftJoin('product_type as pt', 'p.product_type_id', 'pt.product_type_id')
                    .leftJoin('product_lot as pl', 'p.product_id', 'pl.product_id')
                    .where('pl.is_active', '=', 1)
                    .select(
                        'p.product_id',
                        'p.product_name',
                        'p.product_detail',
                        'p.product_image',
                        'p.product_type_id',
                        'pt.product_type',
                        'p.product_width',
                        'p.product_length',
                        'p.product_thickness',
                        'p.unit_id',
                        'p.is_active',
                        
                        'pl.product_lot_id',
                        'pl.product_lot_price',
                        'pl.product_lot_cost',
                        'pl.product_lot_qty',
                        'pl.add_date',

                    )
                    .where('p.is_active', '=', is_active)
                    .orderBy(['p.product_id', { column: 'pl.add_date', order: 'desc' }]);
    
                // Process data to include old product data and separate each product_lot details
                const productSales = productData.reduce((acc, cur) => {
                    if (!acc[cur.product_id]) {
                        acc[cur.product_id] = {
                            product_id: cur.product_id,
                            product_name: cur.product_name,
                            product_detail: cur.product_detail,
                            product_image: cur.product_image,
                            product_type_id: cur.product_type_id,
                            product_type: cur.product_type,
                            product_width: cur.product_width,
                            product_length: cur.product_length,
                            product_thickness: cur.product_thickness,
                            unit_id: cur.unit_id,
                            is_active: cur.is_active,
                            lots: []
                        };
                    }
                    if (cur.product_lot_id) {
                        acc[cur.product_id].lots.push({
                            product_lot_id: cur.product_lot_id,
                            product_lot_price: cur.product_lot_price,
                            product_lot_cost: cur.product_lot_cost,
                            product_lot_qty: cur.product_lot_qty
                        });
                    }
                    return acc;
                }, {});
    
                return Object.values(productSales); // Convert to array of products with old data and separated lots
            } catch (error) {
                console.error(error);
                throw error;
            }
        });
    };
        

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

    update_product_qty(product_lot_id, new_qty) {
        return knex('product_lot')
            .update({ product_lot_qty: new_qty })
            .where({ product_lot_id: product_lot_id });
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
                .where({
                    'order.order_id': order_id,
                    'order_products.status': 'success' // Filter by 'success' status
                });

            // Check if there are no results with 'success' status
            if (result.length === 0) {
                throw new Error('ไม่พอข้อมูลสถานะ');
            }

            // Calculate the total amount by summing up the individual amounts for each row
            let totalAmount = 0;
            result.forEach((row) => {
                const unitPrice = parseFloat(row.unit_price) || 0;
                const quantity = parseInt(row.quantity) || 0;
                totalAmount += unitPrice * quantity;
            });

            // Replace null values with 0 in the result
            const resultWithDefaultValues = result.map((row) => ({
                ...row,
                total_amount: totalAmount,
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
    async get_receiptrefund(order_id) {
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
                    'order_products.order_product_date',
                    'order.point',
                    'product.product_name',
                    'product.product_detail',
                    'product.product_image',
                    'member.member_fname',
                    'member.member_lname',
                    'unit.unit',

                    // Assuming there is a 'unit' field in the 'unit' table
                )
                .leftJoin('order_products', 'order.order_id', 'order_products.order_id')
                .leftJoin('product', 'order_products.product_id', 'product.product_id')
                .leftJoin('member', 'order.member_id', 'member.member_id') // Join with the member table
                .leftJoin('unit', 'product.unit_id', 'unit.unit_id') // Join with the unit table
                .where({
                    'order.order_id': order_id,
                    'order_products.status': 'refund' // Filter by 'success' status
                });

            // Check if there are no results with 'success' status
            if (result.length === 0) {
                throw new Error('ไม่พอข้อมูลสถานะ');
            }

            // Calculate the total amount by summing up the individual amounts for each row
            let totalAmount = 0;
            result.forEach((row) => {
                const unitPrice = parseFloat(row.unit_price) || 0;
                const quantity = parseInt(row.quantity) || 0;
                totalAmount += unitPrice * quantity;
            });

            // Replace null values with 0 in the result
            const resultWithDefaultValues = result.map((row) => ({
                ...row,
                total_amount: totalAmount,
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
    async get_full_product_details_by_product_id(product_id) {
        try {
            // Perform a join operation between the 'product' and 'product_type' tables to get the product details along with its type (category).
            const productDetails = await knex('product as p')
                .join('product_type as pt', 'p.product_type_id', 'pt.product_type_id')
                .select(
                    'p.product_id',
                    'p.product_name',
                    'p.product_detail',
                    'p.product_image',
                    'p.product_width',
                    'p.product_length',
                    'p.product_thickness',
                    'p.unit_id',
                    'p.is_active',
                    'pt.product_type_id',
                    'pt.product_type', // This selects the category of the product
                    // Include any other fields you may need
                )
                .where('p.product_id', product_id)
                .first(); // Assuming you are querying by ID, you should only have one result
    
            return productDetails;
        } catch (error) {
            console.error('Error getting full product details by product_id:', error);
            throw error;
        }
    }
    
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

    getPurchaseHistoryByMember(memberId) {
        return knex('order')
            .select(
                'order.order_id',
                'order.total_amount',
                'order.status',
                'order.order_date',
                'order.point'

            )
            .where('order.member_id', memberId)
            .where('order.status', 'success');
    }

    async getPurchaseHistoryByOrderID(orderId) {
        return knex('order_products')
            .select(
                'order_products.opid',
                'order_products.order_id',
                'order_products.product_id',
                'order_products.itemset_id',
                'order_products.status',
                'order_products.quantity',
                'order_products.unit_price',
                'order_products.cost_price',
                'product.product_name' // Add the product name field
            )
            .leftJoin('product', 'order_products.product_id', 'product.product_id') // Join with the "product" table
            .where('order_products.order_id', orderId);
    }
    async get_lot(product_id) {
        // ขั้นตอนที่ 1: อัปเดต product_lot ที่มีปริมาณเท่ากับ 0 เป็นไม่ใช้งาน
        await knex('product_lot')
            .where({
                product_id: product_id,
                product_lot_qty: 0
            })
            .update({
                is_active: 0
            });
    
        // ขั้นตอนที่ 2: ดึงข้อมูล product_lot ที่ยังมีการใช้งานอยู่และมีปริมาณที่ไม่เท่ากับศูนย์
        return knex('product_lot')
            .join('product', 'product_lot.product_id', '=', 'product.product_id')
            .select('product.product_name', 'product_lot.*')
            .where({
                'product_lot.product_id': product_id,
                'product_lot.is_active': 1
            })
            .andWhere('product_lot.product_lot_qty', '>', 0);
    }
    



    update_lot(lotId, data) {
        return knex('product_lot').where({ product_lot_id: lotId }).update(data);
    }

    async updateLotQuantity(product_id, newQuantity) {
        try {
            // หาวันที่ add_date ที่มากที่สุดสำหรับ product_id นี้
            const maxAddDate = await knex('product_lot')
                .where({ product_id: product_id })
                .max('add_date as max_add_date')
                .first();

            // อัปเดตจำนวนสินค้าใน product_lot ที่มี product_id และ add_date ที่มากที่สุดด้วยค่าใหม่
            await knex('product_lot')
                .where({ product_id: product_id, add_date: maxAddDate.max_add_date })
                .update({ product_lot_qty: newQuantity });

            return { success: true, message: 'อัปเดตจำนวนสินค้าใน product_lot สำเร็จ' };
        } catch (error) {
            console.error(error);
            throw new Error('เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้าใน product_lot');
        }
    }
    get_product_lots_by_product_id(product_id) {
        return knex('product_lot')
            .where({ product_id: product_id, is_active: 1 }) // Assuming you want to include only active lots
            .orderBy('add_date', 'asc'); // Sort by add_date to prioritize older lots
    }

    update_product_lot_quantity(product_lot_id, newQuantity) {
        return knex('product_lot')
            .where({ product_lot_id: product_lot_id })
            .update({ product_lot_qty: newQuantity });
    }

    // Inside your product model
    async get_lot_sum() {
        return knex('product_lot')
            .where('is_active', 1) // Consider only active lots
            .groupBy('product_id')
            .select('product_id', knex.raw('SUM(product_lot_qty) as total_quantity'))
            .orderBy('product_id', 'asc');
    }

    async return_product(order_product_id) {
        try {
            // Find the order product by ID
            const orderProduct = await knex('order_products')
                .where({ opid: order_product_id })
                .first();

            if (!orderProduct) {
                throw new Error('Order product not found');
            }

            // Check if the order product has already been refunded or returned
            if (orderProduct.status === 'refund' || orderProduct.status === 'returned') {
                throw new Error('Order product has already been refunded or returned');
            }

            // Update the order product status to 'returned'
            await knex('order_products')
                .where({ opid: order_product_id })
                .update({ status: 'refund' });

            if (!orderProduct.product_lot_id) {
                throw new Error('Product lot id not found for this order product');
            }

            // Find the corresponding product lot
            const productLot = await knex('product_lot')
                .where({ product_lot_id: orderProduct.product_lot_id })
                .first();

            if (!productLot) {
                throw new Error('Product lot not found');
            }

            // Calculate the new quantity for the product lot
            const newQuantity = productLot.product_lot_qty + orderProduct.quantity;

            // Update the product_lot quantity
            await knex('product_lot')
                .where({ product_lot_id: orderProduct.product_lot_id })
                .update({ product_lot_qty: newQuantity });

            // Return a success message
            return { success: true, message: 'Product returned successfully to the specific product lot' };
        } catch (error) {
            console.error(error);
            throw new Error('Failed to return product');
        }
    }

}


module.exports = new productModel()



