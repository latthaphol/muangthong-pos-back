const model = require('./employeeModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const { genToken } = require('../../middlewares/session');
const { formatMID } = require('../../middlewares/formatter');
const knex = require('../../config/database');
const bcrypt = require('bcrypt');

class employeeController {
   
    // เพิ่มผู้ใช้งาน
    async add_employee(req, res) {
        try {
            const fields = ["user_username", "user_name_surname", "user_password"];
            let { object, missing } = await check_field(req, fields, {});
    
            if (missing.length > 0) {
                failed(res, `Column(s) "${missing.join(', ')}" is missing!`);
            } else {
                const saltRounds = 10; 
                const hashedPassword = await bcrypt.hash(object.user_password, saltRounds);
    

                object.user_password = hashedPassword;
    

                object.user_type = object.user_type || 0;
    
                await model.add_employee(object);
                success(res, { message: "add success.", object });
            }
        } catch (error) {
            console.log(error);
            failed(res, 'Internal Server Error');
        }
    }
    

    
    async get_employee(req, res) {
        try {
          const result = await knex('user').where('user_type', 0).select('*');
          success(res, result, "User list with user_type 0");
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
        

// เพิ่มฟังก์ชันแก้ไขข้อมูลพนักงาน
async update_employee(req, res) {
    try {
        const { employee_id } = req.params; 
        const fields = ["user_username", "user_name_surname"];

        let { object, missing } = await check_field(req, fields, {});

        if (missing.length > 0) {
            failed(res, `Column(s) "${missing.join(', ')}" is missing!`);
        } else {
    
            const updateResult = await model.edit_employee(employee_id, object);

            if (updateResult) {
                success(res, { message: "edit success.", object });
            } else {
                failed(res, 'Employee not found');
            }
        }
    } catch (error) {
        console.log(error);
        failed(res, 'Internal Server Error');
    }
}

async changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        const { user_id } = req.body; // สมมติว่ามี middleware ที่ตรวจสอบ user_id ใส่ไว้แล้ว

        // ตรวจสอบว่ามีข้อมูลที่จำเป็นส่งมาหรือไม่
        if (!oldPassword || !newPassword) {
            return failed(res, 'กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
        const user = await knex('user').where({ user_id }).first();
        if (!user) {
            return failed(res, 'ผู้ใช้ไม่พบ');
        }

        // ตรวจสอบรหัสผ่านเดิม
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.user_password);
        if (!isPasswordCorrect) {
            return failed(res, 'รหัสผ่านเดิมไม่ถูกต้อง');
        }

        // สร้างเซลต์สำหรับการเข้ารหัสรหัสผ่านใหม่
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // บันทึกรหัสผ่านใหม่ลงในฐานข้อมูล
        await knex('user').where({ user_id }).update({ user_password: hashedPassword });

        // ส่งคำตอบกลับให้ผู้ใช้
        success(res, 'เปลี่ยนรหัสผ่านสำเร็จ');
    } catch (error) {
        console.error(error);
        failed(res, 'Internal Server Error');
    }
}

async delete_employee(req, res) {
    try {
        const { employee_id } = req.body; // Receive the employee_id from URL parameters
        if (!employee_id) {
            failed(res, 'Employee ID is missing');
        } else {
            const deleteResult = await model.soft_delete_employee(employee_id);
            if (deleteResult) {
                success(res, { message: "soft delete success" });
            } else {
                failed(res, 'Employee not found');
            }
        }
    } catch (error) {
        console.log(error);
        failed(res, 'Internal Server Error');
    }
}

    
}

module.exports = new employeeController() 