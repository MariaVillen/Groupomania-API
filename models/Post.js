const { Sequelize } = require("sequelize");
const sequelize = require("../utils/database");


const Reports = require("./Report");
const Comments = require("./Comment");
const { post } = require("../app");

const Posts = sequelize.define("posts", {
  idPost: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  attachement: {
    type: Sequelize.STRING,
  },
  content: {
    type: Sequelize.TEXT,
  },
  likes: {
    type: Sequelize.INTEGER.UNSIGNED,
    default: 0,
  },
  content: {
    type: Sequelize.INTEGER.UNSIGNED,
    default: 0,
  }
},{paranoid: true});

// un post can have a lot of comments but a comment belongs only to 1 post.
Posts.hasMany(Comments, { onDelete: "CASCADE" });
Comments.belongsTo(Posts);

// un post can have many reports and a lot of reports but un report only is related to 1 post.
Posts.hasMany(Reports, { onDelete: "CASCADE" });
Reports.belongsTo(Posts, { onDelete: "CASCADE" });

module.exports = Posts;
