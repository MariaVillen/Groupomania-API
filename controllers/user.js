const Users = require("../models/User");
const bcrypt = require("bcryptjs");
const { validation } = require("../helpers/validation");
const ROLES_LIST = require("../utils/roles_list");

// Get all user from list. Information returned will depends on role.
// [GET] http://localhost:3000/user
exports.getAllUsers = (req, res) => {
  // Get the role of the requesting user.
  const roleOfRequestingUser = req.role;

  // ADMIN OWNER PERMISSION ONLY: Visible content only for admins.
  if (roleOfRequestingUser === ROLES_LIST.admin) {
    Users.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    })
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({ DataBaseError: err.message });
      });
  } else if (roleOfRequestingUser === ROLES_LIST.user) {
    // ALL USERS PERMISSION: Visible Content for all users.
    Users.findAll({
      attributes: {
        exclude: ["password", "email", "deleteAt"],
      },
      order: [["createdAt", "DESC"]],
      where: {
        isActive: 1,
        /*id: { [Op.not]: idOfRequestingUser },*/
      },
    })
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({ DataBaseError: err.message });
      });
  }
};

// Get a user by id. Information returned will depends on role and owner of resource.
// [GET] http://localhost:3000/user/:id

exports.getUserById = (req, res) => {
  const userToGet = parseInt(req.params.id);
  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  // Verify if the user id exists in the params of the GET request.
  if (!userToGet) {
    return res.status(400).json({ error: "Indiquez l'id de l'utilisateur" });
  }

  // USER OWNER PERMISSION: If user is asking for his own information

  if (idOfRequestingUser === userToGet) {
    Users.findOne({ where: { id: userToGet } })
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(500).json({ DataBaseError: err.message });
      });
  } else {
    let excludedInfo;

    if (roleOfRequestingUser === ROLES_LIST.admin) {
      // ADMIN PERMISSION: if the requesting user is admin
      excludedInfo = ["password"];
    } else {
      // ALL PERMISSION: if a user is asking for other user information.
      excludedInfo = ["password", "email", "deletedAt"];
    }

    Users.findOne({
      where: { id: userToGet },
      attributes: { exclude: excludedInfo },
    })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({ DataBaseError: err.message });
      });
  }
};

// Update user by id. Permissions will control the allowed champs for update.
// [PUT] http:localhost:3000/user/:id
// Body Content Expected: {requestingUserId, user: {name?, lastName?, email?, password?, cover?, avatar?, state?, role?, bio? }}
exports.updateUser = (req, res) => {
  console.log("updating :", req.body);

  // Requester data
  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  // Confirm if userId exists
  const userToUpdate = parseInt(req.params.id);
  if (!userToUpdate) {
    return res.status(400).json({ error: "Indiquez l'id de l'utilisateur" });
  }
  // Confirm is something to update
  
  const getInfoAllowed = (roleOfRequestingUser, idOfRequestingUser, user) => {
    // FORBIDEN: Not possible to modify un user admin.
    if (user.role === "admin" && user.id !== idOfRequestingUser) {
      return req.status(401).json({
        error: "Vous ne pouvez pas modifier les données d'un administrater.",
      });
    }
    // ADMIN PERMISSION: admin can modify users except the password.
    else if (
      (roleOfRequestingUser === ROLES_LIST.admin && user.role === "user") ||
      user.id === idOfRequestingUser
    ) {
      let newObjectToUpdate = {};

      try {
        if (req.body.lastName) {
          newObjectToUpdate.lastName = validation.isName(req.body.lastName);
          console.log(newObjectToUpdate.lastName);
        }
        if (req.body.name) {
          newObjectToUpdate.name = validation.isName(req.body.name);
          console.log(newObjectToUpdate.name);
        }
        if (req.body.email) {
          newObjectToUpdate.email = validation.isEmail(req.body.email);
          console.log(newObjectToUpdate.email);
        }
        if (req.body.isActive) {
          newObjectToUpdate.isActive = validation.isBoolean(req.body.isActive);
          console.log(newObjectToUpdate.isActive);
        }
        if (req.body.role) {
          newObjectToUpdate.role = req.body.role;
          console.log(newObjectToUpdate.role);
        }
        if (req.body.bio) {
          newObjectToUpdate.bio = validation.cleanWhiteSpace(req.body.bio);
        }
        if (req.body.password) {
          let newPassword = validation.isPassword(req.body.password);
          newPassword = bcrypt.hash(pass, 12);
          newObjectToUpdate.password = newPassword;
          console.log(newObjectToUpdate.password);
        }
        console.log(newObjectToUpdate);
        if (newObjectToUpdate !== {}) {
          return newObjectToUpdate;
        }
      } catch (err) {
        return req.status(400).json({ error: err.message });
      }
    } else {
      return res
        .status(401)
        .json({ message: "Vous n'avez pas les privileges nécessaires" });
    }
  };

  // Find User to Update

  Users.findByPk(userToUpdate)
    .then(async (user) => {
      if (user) {
        //Get the object only with the allowed modifications by rol.
        let modifiedUser = getInfoAllowed(
          roleOfRequestingUser,
          idOfRequestingUser,
          user
        );

        console.log(modifiedUser);

        
        if (req.files) {
          if (req.files.cover[0]) {
            const oldCover = user.coverPicture.split("/images/covers")[1];
            const newCover = `${req.protocol}://${req.get("host")}/images/covers${
              req.files.cover[0].filename
            }`;
            if (user.coverPicture) {
            // eliminar antigua imagen
            fs.unlink(`images/covers${oldCover}`, () => {
              // agregar la nueva url
              modifiedUser.coverPicture = newCover;
            });} else {
              modifiedUser.coverPicture = newCover;
            }
          }
          if (req.files.avatar) {
            const oldAvatar = user.profilePicture.split("/images/persons")[1];
            const newAvatar = `${req.protocol}://${req.get("host")}/images/persons${
              req.files.avatar[0].filename
            }`;
            if (user.profilePicture) {
            // eliminar antigua imagen
            fs.unlink(`images/persons${oldAvatar}`, () => {
              // agregar la nueva url
              modifiedUser.profilePicture = newAvatar;
            });}
            else {
              modifiedUser.profilePicture = newAvatar;
            }
          }
        }
        console.log(modifiedUser);
        Users.update(
          { ...modifiedUser },
          {
            where: { id: userToUpdate },
          }
        )
          .then(() => {
            return res.status(200).json({ message: "Utilisateur modifié" }); // erase if todo is done.
          })
          .catch((err) => {
            return res.status(400).json({ error: err.message });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({ DataBaseError: err.message});
    });
};

// Soft Delete of User by Id
// [DELETE] http:/localhost:3000/delete/:id
exports.deleteUser = (req, res) => {
  //TODO: HANDLE TOKEN / COOKIE

  const userToDelete = parseInt(req.params.id);
  if (!userToDelete) {
    return res.status(400).json({ error: "Indiquez l'id de l'utilisateur" });
  }

  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userIdReq;

  // ADMIN OR USER OWNER PERMISSION ONLY.
  if (
    roleOfRequestingUser === ROLES_LIST.admin ||
    idOfRequestingUser === userToDelte
  ) {
    Users.destroy({
      where: {
        idUsers: userToDelete,
      },
    })
      .then(() => {
        res.status(200).json({ message: "Utilisateur supprimé" });
      })
      .catch((err) => {
        res.status(500).json({ DataBaseError: err.message });
      });
  } else {
    return res.status(400).json({
      error:
        "Vous devez être administrateur pour effacer la compte d'une autre personne",
    });
  }
};
