const model = require('./structModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');

class structController {

    async unit(req, res) {
        try {
            const result = await model.unit()
            success(res, result)
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

    async add_unit(req, res) {
        try {
            const { unit } = req.body
            if (unit) {
                const result = await model.add_unit({ unit })
                success(res, result, "Add unit success!")
            } else {
                failed(res, 'unit cannot blank.')
            }
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

    async product_type(req, res) {
        try {
            const result = await model.product_type()
            success(res, result)
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

    async add_product_type(req, res) {
        try {
            const { product_type } = req.body
            if (product_type) {
                const result = await model.add_product_type({ product_type })
                success(res, result, "Add product_type success!")
            } else {
                failed(res, 'product_type cannot blank.')
            }
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }
    async soft_delete_unit(req, res) {
        try {
            const { unit_id } = req.body;
            if (!unit_id) {
                failed(res, 'Unit ID is missing.');
            } else {
                await model.soft_delete_unit(unit_id);
                success(res, null, 'Unit soft deleted.');
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }

    async soft_delete_product_type(req, res) {
        try {
            const { product_type_id } = req.body;
            if (!product_type_id) {
                failed(res, 'Product Type ID is missing.');
            } else {
                await model.soft_delete_product_type(product_type_id);
                success(res, null, 'Product Type soft deleted.');
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }
}

module.exports = new structController() 