const options = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'main',
        port: 3306
    }
}

const knex = require('knex')(options);

module.exports = knex;
