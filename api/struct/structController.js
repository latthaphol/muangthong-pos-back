const model = require('./structModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const fs = require('fs');
const path = require('path');

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
    async update_unit(req, res) {
        try {
            const { unit_id, new_unit } = req.body;
            if (unit_id && new_unit) {
                const result = await model.update_unit(unit_id, new_unit);
                success(res, result, "Update unit success!");
            } else {
                failed(res, 'Unit ID or updated unit data missing.');
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
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
            const { product_type } = req.body;
            const { buffer, originalname } = req.file;
    
            if (product_type && buffer) {
                // Resize the image to 100x100 pixels
                const resizedBuffer = await model.resizeImage(buffer, { width: 100, height: 100 });
    
                // Specify the directory path
                const directoryPath = path.join('static', 'product_type');

    
                // Create the directory if it doesn't exist
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, { recursive: true });
                    console.log(`Created directory: ${directoryPath}`);
                }
    
                // Save the resized image to the static/product_type directory with a filename based on the product type
                const imageName = `product_type_${product_type}${path.extname(originalname)}`;
                const imagePath = path.join(directoryPath, imageName);
    
                // Log the image path for debugging
                console.log(`Saving image to: ${imagePath}`);
    
                fs.writeFileSync(imagePath, resizedBuffer);
    
                // Assuming add_product_type method of your model accepts an object with product_type_image property
                const result = await model.add_product_type({
                    product_type,
                    product_type_image: imageName, // Save the filename in the database
                    image_name: originalname
                });
    
                success(res, result, "Add product_type success!");
            } else {
                failed(res, 'product_type or image cannot be blank.');
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }
    async update_product_type(req, res) {
        try {
            const { product_type_id, product_type } = req.body;
            let updateData = { product_type };
    
            if (req.file) {
                const { buffer, originalname } = req.file;
                // Assuming you have a similar method for resizing the image
                const resizedBuffer = await model.resizeImage(buffer, { width: 100, height: 100 });
    
                // Specify the directory path
                const directoryPath = path.join('static', 'product_type');
    
                // Ensure the directory exists
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, { recursive: true });
                }
    
                // Define the new image name and path
                const imageName = `product_type_${product_type}${path.extname(originalname)}`;
                const imagePath = path.join(directoryPath, imageName);
    
                // Save the resized image
                fs.writeFileSync(imagePath, resizedBuffer);
    
                // Add the image name to the update data
                updateData.product_type_image = imageName;
            }
    
            if (!product_type_id) {
                failed(res, 'Product Type ID cannot be blank.');
                return;
            }
    
            // Assuming this method exists in your model
            const result = await model.update_product_type(product_type_id, updateData);
            success(res, result, "Product type updated successfully!");
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
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