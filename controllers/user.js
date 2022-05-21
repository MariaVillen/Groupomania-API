const Users = require("../models/User");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { validation } = require("../helpers/validation");
const ROLES_LIST = require("../utils/roles_list");


// Get all user from list. Information returned will depends on role.
// [GET] http://localhost:3000/user
exports.getAllUsers = (req, res) => {
  const roleOfRequestingUser = req.role;
  //const idOfRequestingUser = req.userId;

  // ADMIN OWNER PERMISSION ONLY: Visible content only for admins.
  if (roleOfRequestingUser === ROLES_LIST.admin) {

    Users.findAll({
      attributes: {
        exclude: ["password, refreshToken"],
      },
      order: [["createdAt", "DESC"]],
    })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({ DataBaseError: err.message });
      });
  } else {
    // ALL USERS PERMISSION: Visible Content for all users. Requesting user is exclude from data.

    Users.findAll({
      attributes: {
        exclude: ["password", "email","refreshToken","deleteAt"],
      },
      order: [["createdAt", "DESC"]]
     /* where: {
        isActive: 1,
        /*idUsers: { [Op.not]: idOfRequestingUser },
      }*/
    })
      .then((data) => {
        console.log(data);
        res.status(200).json(data);
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
    Users.findOne({ where: { idUsers: userToGet } })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json({ DataBaseError: err.message });
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
      where: { idUsers: userToGet },
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
  // Requester data
  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  // Confirm if userId exists
  const userToUpdate = parseInt(req.params.id);
  if (!userToUpdate) {
    return res.status(400).json({ error: "Indiquez l'id de l'utilisateur" });
  }

  // TODO: Passing data to variables (normalize)

  const getInfoAllowed = async (
    roleOfRequestingUser,
    idOfRequestingUser,
    user
  ) => {
    // FORBIDEN: Not possible to modify un user admin.
    if (user.role === ROLES_LIST.admin && user.idUsers !== idOfRequestingUser) {
      return req
        .status(401)
        .json({
          error: "Vous ne pouvez pas modifier les données d'un administrater.",
        });
    }

    // ADMIN PERMISSION: admin can modify users except the password.
    else if (roleOfRequestingUser === ROLES_LIST.admin && user.role === "user") {
      try {
        return {
          lastName: validation.isName(req.body.user.lastName),
          name: validation.isName(req.body.user.name),
          email: validation.isEmail(req.body.user.email),
          isActive: validation.isBoolean(req.body.user.state),
          role: req.body.user.role,
          bio: validation.cleanWhiteSpace(req.body.user.bio),
        };
      } catch (err) {
        return req.status(400).json({ error: err.message });
      }
    }

    // OWNER USER PERMISSION: owner user can modifiy restricted info.
    else if (
      roleOfRequestingUser === ROLES_LIST.user &&
      idOfRequestingUser === user.idUsers
    ) {
      console.log("por ahora bien");
      // Hash Password
      let password;
      try {
        const pass = validate.isPassword(req.body.user.password);
      } catch (err) {
        return req.status(400).json({ error: err.message });
      }
      if (pass) {
        password = await bcrypt.hash(pass, 12);
        console.log(password);
      }
      return {
        bio: req.body.user.bio,
        password: password,
      };
    } else {
      return res
        .status(400)
        .json({ error: "Vous n'avez pas les permis necessaires" });
    }
  };

  // Find User to Update

  Users.findByPk(userToUpdate)
    .then(async (user) => {
      if (user) {
        // TODO: HANDLE AND UPDATE IMAGES
        //Get the object only with the allowed modifications by rol.
        const modifiedUser = await getInfoAllowed(
          roleOfRequestingUser,
          idOfRequestingUser,
          user
        );

        if (req.files) {
          const user = await Users.findOne(userToUpdate);
          if (req.body.user.cover) {
            const oldCover = user.coverPicture.split("/images/")[1];
            const newCover = `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`;
          }
          if (req.body.user.avatar) {
            const oldAvatar = user.profilePicture.split("/images/")[1];
            const newAvatar = `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`;
          }

          console.log(req.files);
        }

        Users.update(
          { ...modifiedUser },
          {
            where: { idUsers: userToUpdate },
          }
        )
          .then(() => {
            // If password is being updated
            if (req.body.user.password) {
              //TODO: handle old cookie and token
              /* const token = req.headers.authorization.split(" ")[1];
            //jwt.destroy(token);
            
            //send new cookie or token
            res.status(200).json({
              userId: user.idUsers,
              userRole: user.role,
              token: jwt.sign(
                { userId: user.idUsers, userRole: user.role },
                process.env.SECRET_TOKEN,
                {
                  expiresIn: "1h",
                }
              ),
            });*/
              res.status(200).json({ message: "Utilisateur modifié" }); // erase if todo is done.
            } else {
              res.status(200).json({ message: "Utilisateur modifié" });
            }
          })
          .catch((err) => {
            res.status(400).json({ error: err.message });
          });
      }
    })
    .catch((err) => res.status(500).json({ DataBaseError: err.message }));
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
  if (roleOfRequestingUser === ROLES_LIST.admin || idOfRequestingUser === userToDelte) {
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
    return res
      .status(400)
      .json({
        error:
          "Vous devez être administrateur pour effacer la compte d'une autre personne",
      });
  }
};

//router.put("/:id", userController.updateUser);
/*
  const prodId = req.params.id;

  if (req.file) {
    Sauce.findById(prodId)
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        const sentImageUrl = `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`;

        // Removing old file image and updating sauce
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: prodId },
            {
              ...JSON.parse(req.body.sauce),
              _id: prodId,
              imageUrl: sentImageUrl,
            }
          )
            .then(() => {
              res.status(200).json({ message: "Objet modifié" });
            })
            .catch((err) =>
              res.status(400).json({ message: "Erreur: " + err })
            );
        });
      })
      .catch((err) => res.status(500).json({ message: "Erreur: " + err }));
  } else {
    console.log(req.body);
    // Updating data sauce when image was not changed
    Sauce.updateOne({ _id: prodId }, { ...req.body, _id: prodId })
      .then(() => {
        // Modify Message if update has partially failed because image was not modify on mimetype error
        const message = req.mimetypeError
          ? "Objet modifié. Erreur: L'image n'a pas été modifiée. Veuillez ajouter une image dans le format correct: png, jpg, jpeg."
          : "Objet modifié.";
        res.status(200).json({ message: message });
      })
      .catch((err) => res.status(400).json({ message: "Erreur: " + err }));
  }
};*/
