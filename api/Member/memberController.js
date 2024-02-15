const model = require('./memberModel');
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const { genToken } = require('../../middlewares/session');
const { formatMID } = require('../../middlewares/formatter');
const knex = require('../../config/database');
const bcrypt = require('bcrypt');

class memberController {
    // Add a new member
    async add_member(req, res) {
        try {
            const fields = [
                "user_username",
                "user_password",
                "member_fname",
                "member_lname",
                "member_email",
                "member_address",
                "member_phone",
            ];
            const { object, missing } = await check_field(req, fields, {});

            if (missing.length > 0) {
                failed(res, `Column(s) "${missing.join(', ')}" is missing!`);
            } else {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(object.user_password, saltRounds);

                const newUser = {
                    user_username: object.user_username,
                    user_password: hashedPassword,
                    user_type: 2,
                };

                const userId = await model.register(newUser);

                const newMember = {
                    user_id: userId,
                    member_fname: object.member_fname,
                    member_lname: object.member_lname,
                    member_email: object.member_email,
                    point: object.point || 0,
                    is_active: 1,
                    member_address: object.member_address || "",
                    member_phone: object.member_phone || "",
                };

                await model.add_member(newMember);

                success(res, { message: "User and member added successfully" });
            }
        } catch (error) {
            console.log(error);
            failed(res, "Internal Server Error");
        }
    }

    // List members
    async get_members(req, res) {
        try {
            const members = await knex('member').select('*');
            success(res, members, "Member List");
        } catch (error) {
            console.log(error);
            failed(res, { error: 'Internal Server Error' });
        }
    }

    // Edit employee information

    
    // Edit member information
async update_member(req, res) {
    try {
        const { member_id } = req.params; // Assuming you receive member_id

        // Check if the member exists
        const existingMember = await model.get_member_by_id(member_id);
        if (!existingMember) {
            failed(res, 'Member not found');
            return;
        }

        // Extract the fields you want to update from the request body
        const {
            member_fname,
            member_lname,
            member_email,
            point,
            member_address,
            member_phone,
        } = req.body;

        // Create an object with the fields you want to update
        const updatedMember = {
            member_fname: member_fname || existingMember.member_fname,
            member_lname: member_lname || existingMember.member_lname,
            member_email: member_email || existingMember.member_email,
            point: point || existingMember.point,
            member_address: member_address || existingMember.member_address,
            member_phone: member_phone || existingMember.member_phone,
        };

        // Update the member in the database
        const updateResult = await model.update_member(member_id, updatedMember);

        if (updateResult) {
            success(res, { message: 'Member information updated successfully' });
        } else {
            failed(res, 'Failed to update member information');
        }
    } catch (error) {
        console.log(error);
        failed(res, 'Internal Server Error');
    }
}

    

    // Soft delete an employee
    async delete_member(req, res) {
        try {
            const { member_id } = req.body; // Assuming you receive member_id
            if(!member_id){
                failed(res,'Member ID is missing')
            }    
          else {
               await model.soft_delete_member(member_id);
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }

    async get_memberdetail(req, res) {
        try {
            const memberId = req.params.member_id; // ดึงค่า ID ของสมาชิกจาก URL parameters
            // นำ ID ของสมาชิกไปใช้งาน เช่น ค้นหาข้อมูลสมาชิกในฐานข้อมูล
            const member = await model.get_memberdetail(memberId); // เรียกใช้งานฟังก์ชัน get_memberdetail จากโมเดล โดยส่งค่า member_id ไปด้วย
            res.json(member); // ส่งข้อมูลสมาชิกที่ได้รับกลับไปให้กับไคลเอนต์
        } catch (error) {
            console.error('Error fetching member detail:', error);
            res.status(500).json({ error: 'Failed to fetch member detail' });
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

}

module.exports = new memberController();
