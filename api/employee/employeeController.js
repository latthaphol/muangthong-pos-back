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
        const fields = ["user_username", "user_name_surname", "user_password"];

        let { object, missing } = await check_field(req, fields, {});

        if (missing.length > 0) {
            failed(res, `Column(s) "${missing.join(', ')}" is missing!`);
        } else {
            // เข้ารหัสรหัสผ่านก่อนบันทึกลงในฐานข้อมูล
            if (object.user_password) {
                const saltRounds = 10;
                object.user_password = await bcrypt.hash(object.user_password, saltRounds);
            }

            // อัปเดตข้อมูลพนักงานในฐานข้อมูล
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


async delete_employee(req, res) {
    try {
        const { employee_id } = req.params; // รับค่าพารามิเตอร์ employee_id จาก URL
        const deleteResult = await model.soft_delete_employee(employee_id);

        if (deleteResult) {
            success(res, { message: "soft delete success" });
        } else {
            failed(res, 'Employee not found');
        }
    } catch (error) {
        console.log(error);
        failed(res, 'Internal Server Error');
    }
}

    
}

module.exports = new employeeController() 