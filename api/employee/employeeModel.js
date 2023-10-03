const knex = require('../../config/database')

class employeeModel {
    get_employee() {
        return knex('employee');
    }
    add_employee(data) {
        return knex('user').insert(data)
    }
}

module.exports = new employeeModel();
