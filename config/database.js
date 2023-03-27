const options = {
    client: 'mysql',
    connection: {
        host: '203.159.95.98',
        user: 'root',
        password: 'i2C!n24h',
        database: 'pos_app',
        port: 3311
    }
}

const knex = require('knex')(options);

module.exports = knex;
