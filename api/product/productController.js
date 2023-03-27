const model = require('./productModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const { myFs } = require('../..');

class productController {

    async add_product(req, res) {
        try {
            const fields = ["product_name", "product_detail", "product_cost", "product_price", "product_qty", "product_type_id", "unit_id"]
            let { object, missing } = await check_field(req, fields)
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`)
            } else {
                const dbRes = await model.add_product(object)
                const pid = "PID" + String(dbRes[0]).padStart(6, '0')
                if (req.file) {
                    const oldPath = `static/product/${req.file.filename}`;
                    const newPath = `static/product/${pid}.jpg`; //req.file.originalname.split('.').pop()
                    object = { product_id: dbRes[0], pid, ...object }
                    myFs.rename(oldPath, newPath, function (err) {
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

    async active_product(req, res) {
        try {
            const { product_id, is_active } = req.body
            if (!product_id || !is_active) {
                failed(res, `Column "product_id" or "is_active" is missing!`)
            } else {
                await model.update_product_active(product_id, is_active)
                success(res, req.body, "Product status changed!")
            }
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

    async get_product(req, res) {
        try {
            const { type } = req.query
            // {"active", "delete", "almost", "oos"}
            let result = []
            if (type == "delete") {
                result = await model.get_product(0)
            } else if (type == "almost") {
                result = await model.get_product_less(50)
            } else if (type == "oos") {
                result = await model.get_product_less(0)
            } else {
                result = await model.get_product(1)
            }
            success(res, result, "Product list")
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

}

module.exports = new productController() 