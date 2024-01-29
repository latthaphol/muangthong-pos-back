const options = {
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'pos_productlot',
        port: 3306
    }
}

const knex = require('knex')(options);

module.exports = knex;
