const dbConfig = require("../config/dbConfig.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,{
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected...");
  })
  .catch((err) => {
    console.log("err" + err);
  });

const db = {};

db.kyc = require("./kycModel")(sequelize, DataTypes);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.sequelize
  .sync({
    alter: true,
  })
  .then(() => {
    console.log("yes re-sync done!");
  });

module.exports = db;
