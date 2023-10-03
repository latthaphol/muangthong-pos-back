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

    get_product(is_active) {
        return knex('product as p')
            .select('p.product_id', 'p.product_name', 'p.product_detail', 'p.product_cost', 'p.product_price', 'p.product_qty', 'p.product_image', 'p.product_type_id', 'p.unit_id', 'p.is_active', 'pt.product_type')
            .where({ 'p.is_active': is_active })
            .orWhere({ 'p.is_active': 0 })
            .leftJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
            .andWhere(function() {
                this.where('pt.product_type_id', '=', knex.raw('(SELECT pt2.product_type_id FROM product_type pt2 WHERE pt2.product_type_id = p.product_type_id ORDER BY pt2.product_type_id DESC LIMIT 1)'));
            })
            .orderBy('p.product_id', 'asc'); // Order by product_id in ascending order
    }







   

    /*get_product(active_status) {
        return knex('product as p')
            .where({ 'p.active_status': active_status })
            .leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id');
    }

    get_product(is_active) {
        return knex('product as p').where({ 'p.is_active': is_active })
            .orWhere({ 'p.is_active': 0 }) // แสดงสินค้าที่ถูกลบด้วย
            .leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id');

    }*/


    get_product_less(number) {
        return knex('product as p').where({ 'p.is_active': 1 }).andWhere('p.product_qty', '<=', number)
            //.leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
            .leftOuterJoin('unit as u', 'p.unit_id', '=', 'u.unit_id')
    }
    
    filter_product(status) {
        let query = knex('product as p')
            //.leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
            .leftOuterJoin('unit as u', 'p.unit_id', '=', 'u.unit_id');

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
    
        update_product_quantity(updatedProducts) {
            const promises = updatedProducts.map(product => {
                const { id, quantity } = product;
                return knex('product').update({ product_qty: quantity }).where({ product_id: id });
            });
        
            return Promise.all(promises);
        }
        updateProductQuantities(updatedProducts) {
            const promises = updatedProducts.map(product => {
                const { id, quantity } = product;
                return knex('product').update({ product_qty: quantity }).where({ product_id: id });
            });
        
            return Promise.all(promises);
        }
        
    
}

module.exports = new productModel()



