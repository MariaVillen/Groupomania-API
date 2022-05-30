const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Reports = require("./Report");
const Comments = require("./Comment");

const Posts = sequelize.define(
  "posts",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    attachement: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
    },
    totalLikes: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    totalComments: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    createdAt: {
    type: DataTypes.DATE,          
    },
    updatedAt: {
    type: DataTypes.DATE,
    }
  },
  { paranoid: true }
);

// un post can have a lot of comments but a comment belongs only to 1 post.
Posts.hasMany(Comments, { onDelete: "cascade", hooks: true });
Comments.belongsTo(Posts);

// un post can have many reports and a lot of reports but un report only is related to 1 post.
Posts.hasMany(Reports, { onDelete: "cascade", hooks: true });
Reports.belongsTo(Posts);

module.exports = Posts;
