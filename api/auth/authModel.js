const knex = require('../../config/database')

class authModel {

    login(user_id) {
        return knex('user as u').where('u.user_id', user_id)
    }

    register(data) {
        return knex('user').insert(data)
    }

}

module.exports = new authModel()