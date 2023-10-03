const model = require('./promotionModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const knex = require('../../config/database');

class promotionController {



    async addPromotion(req, res) {
        try {
            const fields = [
                "promotion_name",
                "promotion_detail",
                "discount",
                "promotion_start",
                "promotion_end",
                "quota"
            ];

            const { object, missing } = await check_field(req, fields, {});

            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`);
            } else {
                const newPromotion = {
                    ...object,
                    used: 0,
                    is_active: 1
                };

                await knex('promotion').insert(newPromotion);
                success(res, { message: "Promotion added successfully.", object });
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }


    async updatePromotionStatus() {
        try {
            const currentDate = new Date();

            await knex('promotion')
                .where('promotion_end', '<', currentDate)
                .update({ is_active: 0 });

            console.log('Promotion statuses updated.');
        } catch (error) {
            console.error('Error updating promotion statuses:', error);
        }
    }




    
    async getPromotion(req, res) {
        try {
            const result = await knex('promotion').select('*');
            success(res, result, "Promotion list");
        } catch (error) {
            console.error(error); // แสดงข้อผิดพลาดในรูปแบบของ console.error เพื่อให้เห็นว่ามีข้อผิดพลาดอะไรเกิดขึ้น
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
    async updatePromotion(req, res) {
        try {
            const promotionId = req.params.promotion_id; // Assuming you pass the promotion ID as a parameter

            const fieldsToUpdate = [
                "promotion_name",
                "promotion_detail",
                "discount",
                "promotion_start",
                "promotion_end",
                "quota"
            ];

            const { object, missing } = await check_field(req, fieldsToUpdate, {});

            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`);
            } else {
                const updatedPromotionData = {
                    ...object
                };

                await knex('promotion')
                    .where('promotion_id', promotionId)
                    .update(updatedPromotionData);

                success(res, { message: "Promotion updated successfully.", updatedPromotionData });
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }

    async softDeletePromotion(req, res) {
        try {
            const { promotion_id } = req.body;
            if (!promotion_id) {
                failed(res, 'Promotion ID is missing.');
            } else {
                await knex('promotion')
                    .where('promotion_id', promotion_id)
                    .update({ is_active: 0 });

                success(res, null, 'Promotion soft deleted.');
            }
        } catch (error) {
            console.error('Error soft deleting promotion:', error);
            failed(res, 'Internal Server Error');
        }
    }


    async switchActive(req, res) {
        try {
            const { promotion_id } = req.params; // หรือวิธีที่คุณใช้ในการรับ promotion_id
    
            const promotion = await knex('promotion')
                .where('promotion_id', promotion_id)
                .first();
    
            if (!promotion) {
                // หากไม่พบโปรโมชั่นด้วย promotion_id ที่ระบุ
                failed(res, 'Promotion not found.');
                return;
            }
    
            const newStatus = promotion.is_active === 1 ? 0 : 1;
    
            await knex('promotion')
                .where('promotion_id', promotion_id)
                .update({ is_active: newStatus });
    
            console.log('Promotion status updated.');
            success(res, { message: "Promotion status updated.", newStatus });
        } catch (error) {
            console.error('Error updating promotion status:', error);
            failed(res, 'Internal Server Error');
        }
    }
    
}


module.exports = new promotionController() 