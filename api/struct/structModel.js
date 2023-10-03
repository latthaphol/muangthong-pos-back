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
    async soft_delete_unit(unitId) {
        await knex('unit').where({ unit_id : unitId}).update({ is_active: 0 });
    }
    
    async soft_delete_product_type(productTypeId) {
        await knex('product_type').where({ product_type_id: productTypeId }).update({ is_active: 0 });
    }
}

module.exports = new structModel()