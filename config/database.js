const options = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'pos17',
        port: 3306
    }
}

const knex = require('knex')(options);

module.exports = knex;
