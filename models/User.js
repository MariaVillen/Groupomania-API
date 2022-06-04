const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Posts = require("./Post");
const Reports = require("./Report");
const Comments = require("./Comment");


const Users = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        min: {
          args: 3,
          msg: "Le nom doit être au moins de 3 lettres.",
        },
        max: {
          args: 50,
          msg: "Le nom ne peut pas dépasser les 50 lettres.",
        },
        is: {
          args: /^([A-zàâçéèêëîïôûùüÿñæœ']+\s?)+\S/,
          msg: "Seulement sont accesptés les lettres et le character -",
        },
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        min: {
          args: 3,
          msg: "Le prenom doit être au moins de 3 lettres.",
        },
        max: {
          args: 100,
          msg: "Le prenom ne peut pas dépasser les 100 characters.",
        },
        is: {
          args: /^([A-zàâçéèêëîïôûùüÿñæœ']+\s?)+\S/,
          msg: "Seulement sont accesptés les lettres et le character -",
        },
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        min: 7,
        isEmail: {
          args: true,
          msg: "Le format doit être valide pour un email. Exemple: joedoe@mail.com",
        },
      },
      unique: "email",
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
      is: /^[0-9a-f]{64}$/i,
    },
    profilePicture: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    coverPicture: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    isActive: {
      type: DataTypes.TINYINT,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
      validate: {
        isIn: {
          args: [["user", "admin"]],
          msg: "Le role doit être admin ou user.",
        },
      },
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
  },
  { paranoid: true }
); // soft delete

//Asociations

Users.belongsToMany(Users, { as: "follows", through: 'User_Follow_User', foreignKey: 'followingId', otherKey: 'followedId' })

Users.hasMany(Posts)
Posts.belongsTo(Users);

Users.hasMany(Comments);
Comments.belongsTo(Users);

Users.belongsToMany(Comments, {through: "likesComment"});
Comments.belongsToMany(Users, {through: "likesComment"});

Users.hasMany(Reports);
Reports.belongsTo(Users);

Users.belongsToMany(Posts, { through: "User_Like_Post"});
Posts.belongsToMany(Users, { through: "User_Like_Post"});


module.exports = Users;
