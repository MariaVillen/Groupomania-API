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
  },
  createdAt: {
    type: DataTypes.DATE,
    get: function () {
      return this.getDataValue("createdAt")?.toLocaleString();
    },
  },
  updatedAt: {
    type: DataTypes.DATE,
    get: function () {
      return this.getDataValue("updatedAt")?.toLocaleString();
    },
  },
  deletedAt: {
    type: DataTypes.DATE,
    get: function () {
      return this.getDataValue("deletedAt")?.toLocaleString();
    }
  }
});

module.exports = Reports;
