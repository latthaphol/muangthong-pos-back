const options = {
    client: 'mysql',
    connection: {
        host: 'bcmzjcg2vcphd3fzqmxu-mysql.services.clever-cloud.com',
        user: 'uyuxekmpn7v3wp1f',
        password: 'awI0ujrUQiuK63NfDirH',
        database: 'bcmzjcg2vcphd3fzqmxu',
        port: 3306
    }
}

const knex = require('knex')(options);

module.exports = knex;
