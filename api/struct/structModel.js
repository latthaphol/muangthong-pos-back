const knex = require('../../config/database')

class structModel {

    unit() {
        return knex('unit').where('is_active', 1)
    }

    add_unit({ unit }) {
        return knex('unit').insert({ unit })
    }

    product_type() {
        return knex('product_type').where('is_active', 1)
    }

    add_product_type({ product_type }) {
        return knex('product_type').insert({ product_type })
    }

}

module.exports = new structModel()