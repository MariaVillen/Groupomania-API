const { Sequelize } = require("sequelize");
const sequelize = require("../utils/database");

const Posts = require("./Post");
const Reports = require("./Report");
const Comments = require("./Comment");

const Users = sequelize.define("users", {
  idUsers: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      min: 3,
      max: 30,
      notEmpty: true, 
    }
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      min: {
        args: 3,
        msg: 'Le nom doit être au moins de 3 lettres.'
      },
      max:{
        args: 50,
        msg: 'Le nom ne peut pas dépasser les 50 lettres.'
      },
      is: {
        args: /^[a-zàâçéèêëîïôûùüÿñæœ .-]+$/i,
        msg: 'Seulement sont accesptés les lettres et le character -'},
      notEmpty: true
    }
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      min: {
        args: 3,
        msg: 'Le prenom doit être au moins de 3 lettres.'
      },
      max:{
        args: 50,
        msg: 'Le prenom ne peut pas dépasser les 50 lettres.'
      },
      is: {
        args: /^[a-zàâçéèêëîïôûùüÿñæœ .-]+$/i,
        msg: 'Seulement sont accesptés les lettres et le character -'},
      notEmpty: true
    }
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { min: 7, max: 50, 
      isEmail: {
        args: true,
        msg: 'Le format doit être valide pour un email. Exemple: joedoe@mail.com'}
      },
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: { 
      min: 8, 
      max: 255 
    },
  },
  profilePicture: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  coverPicture: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  bio: {
    type: Sequelize.TEXT,
    defaultValue: "",
  },
  isActive: {
    type: Sequelize.TINYINT,
    defaultValue: false,
  },
  rol: {
    type: Sequelize.DataTypes.ENUM(
      "utilisateur",
      "moderateur",
      "administrateur"
    ),
    allowNull: false,
    defaultValue: "utilisateur",
    validate: {
      isIn: {
        args: [['utilisateur', 'moderateur', 'administrateur']],
        msg: "Must be utilisateur, moderateur ou administrateur."
      }
    }
  },
});

// Friends
Users.belongsToMany(Users, {
  through: "Friends",
  as: "idFriend",
  onDelete: "CASCADE",
});

// 1 user per Post but a User can have many posts.
Users.hasMany(Posts);
Posts.belongsTo(Users);

// Like Posts
Users.belongsToMany(Posts, { through: "likedPosts", onDelete: "CASCADE" });
Posts.belongsToMany(Users, { through: "likedPosts", onDelete: "CASCADE" });

// 1 user per comment but a user can make many comments.
Users.hasMany(Comments);
Comments.belongsTo(Users);

// Like comments
Users.belongsToMany(Comments, {
  through: "likedComments",
  onDelete: "CASCADE",
});
Comments.belongsToMany(Users, {
  through: "likedComments",
  onDelete: "CASCADE",
});

// a reporta has 1 user but a lot of users can make a lot of reports
Users.hasMany(Reports);
Reports.belongsTo(Users);

module.exports = Users;
