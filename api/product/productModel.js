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
        return knex('product as p').where({ 'p.is_active': is_active })
            .leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
            .leftOuterJoin('unit as u', 'p.unit_id', '=', 'u.unit_id')
    }

    get_product_less(number) {
        return knex('product').where({ 'p.is_active': 1 }).andWhere('product_qty', '<=', number)
            .leftOuterJoin('product_type as pt', 'p.product_type_id', '=', 'pt.product_type_id')
            .leftOuterJoin('unit as u', 'p.unit_id', '=', 'u.unit_id')
    }

}

module.exports = new productModel()