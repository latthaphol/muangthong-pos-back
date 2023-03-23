const options = {
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'fatcat-db',
        database: 'fatcat'
    }
}

const knex = require('knex')(options);

module.exports = knex;
