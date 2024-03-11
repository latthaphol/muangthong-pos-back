const knex = require('../../config/database')
const sharp = require('sharp');

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

    add_product_type({ product_type, product_type_image }) {
        return knex('product_type').insert({
            product_type,
            product_type_image,
            is_active: 1,
        });
    }
    
    async soft_delete_unit(unitId) {
        await knex('unit').where({ unit_id : unitId}).update({ is_active: 0 });
    }
    
    async soft_delete_product_type(productTypeId) {
        await knex('product_type').where({ product_type_id: productTypeId }).update({ is_active: 0 });
    }
    async resizeImage(buffer, options) {
        return sharp(buffer)
            .resize(options)
            .toBuffer();
    }
    update_product_img({ product_id, product_type_image }) {
        return knex('product_type').update({ product_type_image }).where({ product_id })
    }
    update_product_type(productTypeId, updateData) {
        return knex('product_type')
            .where({ product_type_id: productTypeId })
            .update(updateData);
    }
    async update_unit(unit_id, new_unit) {
        try {
            const result = await knex('unit')
                .where({ unit_id: unit_id })
                .update({ unit: new_unit }); 
            return result;
        } catch (error) {
            throw new Error('Error updating unit: ' + error.message);
        }
    }
    
    
}

module.exports = new structModel()