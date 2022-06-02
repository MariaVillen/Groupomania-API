const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Reports = sequelize.define("reports", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  state: {
    type: DataTypes.ENUM("Non lu", "En cours", "Accepté", "Rejeté", "Archivé"),
    defaultValue: "Non lu"
  }
});

module.exports = Reports;
