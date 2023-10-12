const knex = require('../../config/database')

class memberModel {
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
    register(data) {
        return knex('user').insert(data)
    }
    registerMember(data) {
        return knex('member').insert(data);
    }
    add_member(newMember) {
        return knex('member').insert(newMember);
    }
    soft_delete_member(member_id) {
        return knex('member')
            .where('member_id', member_id)
            .update('is_active', 0);
    }
    // Update a member's information
    update_member(member_id, updateObject) {
        return knex('member')
            .where('member_id', member_id)
            .update({
                member_fname: updateObject.member_fname,
                member_lname: updateObject.member_lname,
                member_email: updateObject.member_email,
                member_address: updateObject.member_address || '',
                member_phone: updateObject.member_phone || ''
            });
    }
    // Get a user by user_id
    getUserById(user_id) {
        return knex('user')
            .where('user_id', user_id)
            .first(); // ใช้ first() เพื่อดึงแถวแรกเท่านั้น
    }
    // Update a user's password
    updateUserPassword(user_id, hashedPassword) {
        return knex('user')
            .where('user_id', user_id)
            .update('user_password', hashedPassword);
    }
    get_member_by_id(member_id) {
        return knex('member')
            .where('member_id', member_id)
            .first(); // ใช้ first() เพื่อดึงแถวแรกเท่านั้น
    }
}

module.exports = new memberModel();
