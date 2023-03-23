const knex = require('../../config/database')

class authModel {

    login(username) {
        return knex('user as u').where('u.username', username)
    }

    // register(data) {
    //     return knex('user').insert(data)
    // }

}

module.exports = new authModel()