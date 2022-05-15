require('dotenv').config()

module.exports = {
    HOST: process.env.DATABASE_HOST,
    USER: process.env.DATABASE_USERNAME,
    PASSWORD: process.env.DATABASE_PASSWORD,
    DB: process.env.DATABASE_NAME,
    dialect: 'mysql',

    // HOST: 'localhost',
    // USER: 'root',
    // PASSWORD: '',
    // DB: 'customer_kyc',
    // dialect: 'mysql',


    

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}