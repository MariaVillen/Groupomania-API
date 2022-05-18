const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Reports = require("./Report");

const Comments = sequelize.define(
  "comments",
  {
    idComment: {
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
      default: 0,
    },
  },
  { paranoid: true }
);

Comments.hasMany(Reports, { onDelete: "CASCADE" });
Reports.belongsTo(Comments, { onDelete: "CASCADE" });

module.exports = Comments;
