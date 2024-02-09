const knex = require('knex');

const options = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
};

const db = knex(options);

// Test the database connection
db.raw('SELECT 1+1 as result')
    .then(() => {
        console.log('Connected to the database successfully');
    })
    .catch(error => {
        console.error('Error connecting to the database:', error.message);
    });

module.exports = db;
