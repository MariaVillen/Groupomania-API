const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Reports = require("./Report");

const Comments = sequelize.define(
  "comments",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
    },
    likes: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      get: function () {
        return this.getDataValue("createdAt").toLocaleString();
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  { paranoid: true }
);

Comments.hasMany(Reports, { onDelete: "CASCADE" });
Reports.belongsTo(Comments, { onDelete: "CASCADE" });

module.exports = Comments;
