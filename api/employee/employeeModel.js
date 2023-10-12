const knex = require('../../config/database')

class employeeModel {
    get_employee() {
        return knex('employee');
    }
    add_employee(data) {
        return knex('user').insert(data)
    }
    soft_delete_employee(employee_id) {
        return knex('employee')
            .where('employee_id', employee_id)
            .update('is_active', 0);
    }
    edit_employee(employee_id, data) {
        return knex('user')
            .where('user_id', employee_id)
            .update(data);
    }
    
}

module.exports = new employeeModel();
