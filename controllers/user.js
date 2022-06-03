const Users = require("../models/User");
const bcrypt = require("bcryptjs");
const { validation } = require("../helpers/validation");
const ROLES_LIST = require("../utils/roles_list");
const fs = require("fs");

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
    Users.findOne({ where: { id: userToGet },
    include: [{
      model: Users,
      as: "follows"
    }]})
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
      include: [{
        model: Users,
        as: "follows"
      }]})
      .then((data) => {
        console.log("USER BY ID: ", data);
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

  console.log("req body : " ,req.body);

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
        if (req.body.isActive === 1 || req.body.isActive === 0) {
          newObjectToUpdate.isActive = req.body.isActive;
        } else {
          throw new Error("Le value doit etre 0 ou 1.");
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
          if (req.files.cover) {
            const oldCover = user.coverPicture.split("/images/covers/")[1];
            console.log("odlImage ", oldCover);
            const newCover = `${req.protocol}://${req.get("host")}/images/covers/${
              req.files.cover[0].filename
            }`;
            if (user.coverPicture) {
            // eliminar antigua imagen
            fs.unlinkSync(`images/covers/${oldCover}`);
            }
            modifiedUser.coverPicture = newCover;
          }
          if (req.files.avatar) {
            const oldAvatar = user.profilePicture.split("/images/persons/")[1];
            console.log("OLDAVATAR: ", oldAvatar);
            const newAvatar = `${req.protocol}://${req.get("host")}/images/persons/${
              req.files.avatar[0].filename}`;
              console.log("user profile picture ", user);
            if (user.profilePicture) {
            // eliminar antigua imagen
            fs.unlinkSync(`images/persons/${oldAvatar}`);
            }
            modifiedUser.profilePicture = newAvatar;
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
            return res.status(200).json({ "message": modifiedUser }); // erase if todo is done.
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

// Handle Follows
// [POST] http://localhost:3500/api/user/:id/follow

exports.postFollowsHandler = (req, res) =>{

  const userFollowed = parseInt(req.params.id);
  const userFollower = req.userId;

  console.log("paso por followerrs");
  if (userFollowed === userFollower) {
    return res.status(400).json({ error: "Vous en pouvez pas vous suivre a vous même" });
  }
  if(!userFollowed) {
    return res.status(400).json({ error: "Manque de parametres" });
  }

  // Find 

  Users.findByPk(userFollowed)
    .then((followed) => {
      if (followed) {
        // LIKE
        Users.findByPk(userFollower).then((follower) => {
          follower.hasFollows(followed).then((isFollowing) => {
            if (isFollowing) {
              return follower.removeFollows(followed).then((result) => {
                  console.log(result);
                  return res.status(204).json({ message: result });
              });
            } else {
              return follower
                .addFollows(followed)
                .then((result) => {
                  console.log(result);
                  return res.status(200).json({ message: result });
                });
            }
          });
        });
      } else {
        return res.status(404).json({ error: "Utilisateur Non trouvé" });
      }}
    )
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    })
};

// Get follows
// [GET] http://localhost:3000/api/user/:id/follows
exports.getUserFollows = (req, res) => {
  const userFollowed = req.params.id;
  const userFollower = req.userId;

  Users.findByPk(userFollower)
    .then((userWhoFollow) => {
      if (userWhoFollow) {
        return userWhoFollow
          .getFollows()
          .then((result) => res.status(200).json(result));
      } else {
        return res.status(404).json("message", "Utilisateur non trouvé");
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
