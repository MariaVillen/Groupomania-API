const fs = require("fs");
const Op = require("sequelize");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const { validation } = require("../helpers/validation");
const ROLES_LIST = require("../utils/roles_list");
const Users = require("../models/User");

// Get all user from list. Information returned will depends on role.
// [GET] http://localhost:3500/user

exports.getAllUsers = (req, res) => {

  // Get the role of the requesting user.
  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  // ADMIN OWNER PERMISSION ONLY: Visible content only for admins.
  if (roleOfRequestingUser === ROLES_LIST.admin) {
    Users.findAll({
      attributes: {
        exclude: [ "password" ],
      },
      order: [[ "createdAt", "DESC" ]],
    })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({ "DataBaseError": err.message });
    });

     // ALL USERS PERMISSION: Visible Content for all users.
  } else if (roleOfRequestingUser === ROLES_LIST.user) {
    Users.findAll({
      attributes: {
        exclude: [ "password", "email", "deleteAt" ]
      },
      order: [[ "createdAt", "DESC" ]],
      where: {
        isActive: 1,
        /*id: { [ Op.not ]: idOfRequestingUser }*/
      },
    })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({ DataBaseError: err.message });
    });
  }

};


// Get a user by id. Information returned will depends on role and owner of resource.
// The user will be returned with a list of followed persons.
// [GET] http://localhost:3500/user/:id

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

    Users.findByPk(userToGet, { 
       attributes: ["id", "name", "lastName", "coverPicture", "profilePicture", "bio"]
    })
    .then(( data ) => {
      return res.status( 200 ).json( data );
    })
    .catch((err) => {
      return res.status( 500 ).json({ "DataBaseError": err.message });
    });

  } else {

    let excludedInfo;

    // ADMIN PERMISSION: if the requesting user is admin
    if (roleOfRequestingUser === ROLES_LIST.admin) {
      excludedInfo = [ "password" ];

     // ALL PERMISSION: if a user is asking for other user information.
    } else {
      excludedInfo = [ "password", "email", "deletedAt" ];
    }

    Users.findOne({
      where: { id: userToGet },
      attributes: { exclude: excludedInfo },
      include: [{
        model: Users,
        as: "follows"
      }]
    })
    .then(( data ) => {
      return res.status(200).json( data );
    })
    .catch((err) => {
      return res.status(500).json({ "DataBaseError": err.message });
    });
  }
};


// Update user by id. Permissions will control the allowed champs for update.
// [PUT] http:localhost:3500/user/:id

exports.updateUser = (req, res) => {

  // Requester data
  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  // Confirm if userId exists
  const userToUpdate = parseInt( req.params.id );
  if ( !userToUpdate ) {
    return res.status( 400 ).json({ "error": "Indiquez l'id de l'utilisateur" });
  }

  // Confirm is something to update

  const getInfoAllowed = ( roleOfRequestingUser, idOfRequestingUser, user ) => {

    // FORBIDEN: Not possible to modify un user admin.
    if ( user.role === "admin" && user.id !== idOfRequestingUser ) {
      return res.status( 401 ).json({
        "error": "Vous ne pouvez pas modifier les données d'un administrateur.",
      });
    }

    // ADMIN PERMISSION: admin can modify users except the password.
    else if (( roleOfRequestingUser === ROLES_LIST.admin && user.role === "user" )
              || user.id === idOfRequestingUser) {

      let newObjectToUpdate = {};

      try {

        if ( req.body.lastName ) {
          newObjectToUpdate.lastName = validation.isName( req.body.lastName );
        }
        if ( req.body.name ) {
          newObjectToUpdate.name = validation.isName( req.body.name );
        }
        if ( req.body.email ) {
          newObjectToUpdate.email = validation.isEmail( req.body.email );
        }
        if ( req.body.isActive === 1 || req.body.isActive === 0 ) {
          newObjectToUpdate.isActive = req.body.isActive;
        } 
        if ( req.body.role ) {
          newObjectToUpdate.role = req.body.role;
        }
        if ( req.body.bio ) {
          newObjectToUpdate.bio = validation.cleanWhiteSpace( req.body.bio );
        }
        if ( req.body.password ) {
          let newPassword = validation.isPassword( req.body.password );
          newPassword = bcrypt.hash( pass, 12 );
          newObjectToUpdate.password = newPassword;
        }
        if ( newObjectToUpdate !== {} ) {
          return newObjectToUpdate;
        }

      } catch ( err ) {
        console.log(err);
        return res.status( 400 ).json({ "error": err.message });
      }
    } else {
      return res.status( 401 ).json({ "message": "Vous n'avez pas les privileges nécessaires" });
    }
  };

  // Find User to Update

  Users.findByPk( userToUpdate )
  .then( async ( user ) => {

    if ( user ) {
      //Get the object only with the allowed modifications by rol.
      let modifiedUser = getInfoAllowed(
        roleOfRequestingUser,
        idOfRequestingUser,
        user
      );

      // If there are files to modify
      if ( req.files ) {
          console.log("archivos: ", req.files);

        if ( req.files.cover ) {
          const oldCover = user.coverPicture.split( "/images/covers/" )[1];
          const newCover = `${ req.protocol }://${ req.get( "host" ) }/images/covers/${ req.files.cover[0].filename }`;
        
        // eliminar antigua imagen
        if ( user.coverPicture ) {
          fs.access(`images/covers/${oldCover}`, fs.constants.R_OK, (err) => {
            if (err) {
              console.error('No Read access');
            } else {
            fs.unlink(`images/covers/${oldCover}`);
            }
          });
        }
      
        modifiedUser.coverPicture = newCover;
        }

        if ( req.files.avatar ) {
          const oldAvatar = user.profilePicture.split("/images/persons/")[1];
          const newAvatar = `${req.protocol}://${req.get("host")}/images/persons/${req.files.avatar[0].filename}`;
          // eliminar antigua imagen   
          if (user.profilePicture) {
            fs.access(`images/persons/${oldAvatar}`, fs.constants.R_OK, (err) => {
              if (err) {
                console.error('No Read access');
               } else {
              fs.unlink(`images/persons/${oldAvatar}`);
              }
            });
          }
          modifiedUser.profilePicture = newAvatar;
        }
          
      }
      Users.update({ ...modifiedUser },{
        where: { id: userToUpdate },
      })
      .then(() => {
        return res.status( 200 ).json({ "message": modifiedUser }); 
      })
      .catch(( err ) => {
        console.log(err);
        return res.status( 400 ).json({ "error": err.message });
      })
    }
  })
  .catch(( err ) => {
      res.status( 500 ).json({ "DataBaseError": err.message});
  })
}


// Soft Delete of User by Id
// [DELETE] http:/localhost:3500/delete/:id
exports.deleteUser = (req, res) => {
  //TODO: HANDLE TOKEN 

  const userToDelete = parseInt( req.params.id );

  if ( !userToDelete ) {
    return res.status( 400 ).json({ "error": "Indiquez l'id de l'utilisateur" });
  }

  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  // ADMIN OR USER OWNER PERMISSION ONLY.
  if (
    roleOfRequestingUser === ROLES_LIST.admin ||
    idOfRequestingUser === userToDelete
  ) {

    Users.destroy({
      where: {
        id: userToDelete,
      },
    })
    .then(() => {

      // Delete cookie
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      return res.status( 200 ).json({ "message": "Utilisateur supprimé" });

    })
    .catch(( err ) => {
        return res.status( 500 ).json({"DataBaseError": err.message });
    });

  } else {
    return res.status( 401 ).json({"error": "Non authorisé"});
  }
};


// Following and unfollowing hanlder.
// [POST] http://localhost:3500/api/user/:id/follow

exports.postFollowsHandler = (req, res) =>{

  const userFollowed = parseInt( req.params.id );
  const userFollower = req.userId;

  if ( userFollowed === userFollower ) {
    return res.status( 400 ).json({ "error": "Operation interdite" });
  }

  if( !userFollowed ) {
    return res.status( 400 ).json({ "error": "Manque de parametres" });
  }

  // Find following / followed users

  Users.findByPk( userFollowed )
  .then(( followed ) => {
    if ( followed ) {
      Users.findByPk( userFollower )
      .then(( follower ) => {
        follower.hasFollows( followed )
        .then(( isFollowing ) => {
            if ( isFollowing ) {
              return follower.removeFollows( followed )
              .then(( result ) => {
                  return res.status( 204 ).json({"message": result });
              });
            } else {
              return follower.addFollows( followed )
              .then(( result ) => {
                return res.status( 200 ).json({ "message": result });
              });
            }
          });
        });
      } else {
        return res.status( 404 ).json({ "error": "Utilisateur Non trouvé" });
      }}
    )
    .catch(( err ) => {
      return res.status( 500 ).json({ "error": err.message });
    })
};


// Get follows
// [GET] http://localhost:3500/api/user/:id/follows

exports.getUserFollows = (req, res) => {
  const userFollowed = req.params.id;
  const userFollower = req.userId;

  Users.findByPk( userFollower )
  .then(( userWhoFollow ) => {
    if ( userWhoFollow ) {
      return userWhoFollow.getFollows()
      .then(( data ) => res.status( 200 ).json(data));
    } else {
      return res.status( 404 ).json({"message": "Utilisateur non trouvé"});
    }
  })
  .catch(( err ) => {
    return res.status( 500 ).json({ "error": err.message });
  });
};
