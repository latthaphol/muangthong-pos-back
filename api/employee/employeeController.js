const model = require('./employeeModel')
const { success, failed } = require('../../config/response');
const { check_field } = require('../../middlewares/utils');
const { genToken } = require('../../middlewares/session');
const { formatMID } = require('../../middlewares/formatter');
const knex = require('../../config/database');

class employeeController {
   
    // UID000001
    async add_employee(req, res) {
        try {
            const fields = ["user_fname", "user_lname", "user_email", "user_password"]
            let { object, missing } = await check_field(req, fields, { })
            if (missing.length > 0) {
                failed(res, `Column "${missing}" is missing!`)
            } else {
                await model.add_employee(object)
                success(res, { message: "add success.", object })
            }
        } catch (error) {
            console.log(error)
            failed(res, 'Internal Server Error')
        }
    }

    
    async get_employee(req, res) {
        try {
          const result = await knex('user').where('user_type', 0).select('*');
          success(res, result, "User list with user_type 1");
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
        



    
}

module.exports = new employeeController() 