const Sequelize = require("sequelize");

// Database connection Pull
const sequelize = new Sequelize(
  process.env.DEFAULT_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.HOST,
  }
);

module.exports = sequelize;
