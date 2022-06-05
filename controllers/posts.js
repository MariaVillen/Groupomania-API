const fs = require("fs");
const { Op } = require("sequelize");
const moment = require("moment");

const ROLES_LIST = require("../utils/roles_list");

const Posts = require("../models/Post");
const Users = require("../models/User");


// Add a post
// [POST] http:/localhost:3500/api/post
exports.addPost = (req, res) => {


  // Verifications 
  if ( !req.body.userId ) {
    return res.status( 400 ).json({ "error":"Manque d'arguments (Id de l'utilisateur)" });
  }

  const userOwner = parseInt(req.body.userId);

  if ( userOwner !== req.userId && req.roles !== ROLES_LIST.admin ) {
    console.log("POST USER ", userOwner ,  " " , typeof userOwner, " REQUESTINGUSER ", req.userId, " ", typeof req.userId);
    console.log("condicion ",  userOwner !== req.userId);
    return res.status( 401 ).json({ "error": "operation interdit" });
  }

  let sentImageUrl;

  if ( req.file ) {

    // Getting file name
    sentImageUrl = `${ req.protocol }://${ req.get("host") }/images/posts/${ req.file.filename }`;

    // If the image is not of the correct mimetype return error.
    if ( req.mimetypeError ) {
      return res.status(400).json({
        "erreur":"Le fichier n'est pas dans un format valide: png, jpg, webp, gif ou jpeg",
      });
    }
  }

  if ( req.body.content || sentImageUrl ) {
    Posts.create({
      attachement: sentImageUrl,
      content: req.body.content,
      userId: userOwner,
    })
    .then( () => {
      return res.status( 200 ).json({ "message": "Publication ajoutée!" });
    })
    .catch( ( err ) => {
      return res.status( 400 ).json({ "error": err.message });
    });

  } else {
    return res.status( 400 ).json({"error": "Vous devez ajouter ou bien une image ou bien du texte."});
  }
};

// Get all Posts
// [GET] http:/localhost:3500/api/post
exports.getAllPosts = (req, res) => {
  Posts.findAll({
    include: [{
        model: Users,
        attributes: [ "profilePicture","coverPicture","id","bio","name","lastName" ]
    }],
    order: [[ "createdAt", "DESC" ]],
  })
  .then(( data ) => {
    return res.status( 200 ).json( data );
  })
  .catch(( err ) => {
    return res.status( 500 ).json({ "error": err.message });
  });
};

// Get all Posts
// [GET] http:/localhost:3500/api/post/topten
exports.getAllPostsTopTen = (req, res) => {

  let nowDate = moment().startOf("day").subtract(7, "days").toDate();

  Posts.findAll({
    include: [{
        model: Users,
        attributes: [ "profilePicture", "coverPicture", "id", "bio", "name", "lastName" ]
    }],
    order: [[ "totalComments", "DESC" ]],
    limit: 5,
    where: { createdAt: { [ Op.gt ]: nowDate}}
  })
  .then(( data ) => {
    return res.status( 200 ).json( data );
  })
  .catch(( err ) => {
    return res.status( 500 ).json({ "error": err.message });
  });
};

// Get Posts By Id
// [GET] http:/localhost:3500/api/post/:id
exports.getPostById = (req, res) => {

  const postToGet = req.params.id;

  // Verify if the user id exists in the params of the GET request.
  if ( !postToGet ) {
    return res.status( 400 ).json({ "error": "Indiquez l'id de l'utilisateur" });
  }

  Posts.findOne({
    where:{ id: postToGet },
    include: [{
        model: Users,
        attributes: [ "profilePicture","coverPicture", "id","bio","name","lastName"]
    }]
  })
  .then( ( data ) => {
    return res.status( 200 ).json( data );
  })
  .catch( ( err ) => {
    return res.status( 401 ).json({ "error": err.message });
  });
};

// Get all posts from a single user
// [GET] http:/localhost:3500/api/post/user/:id
exports.getPostByUserId = (req, res) => {

  const userOwner = req.params.id;
  // Verify if the user id exists in the params of the GET request.
  if (!userOwner) {
    return res.status( 400 ).json({ "error": "Indiquez l'id de l'utilisateur" });
  }

  Posts.findAll({
    include: [{
        model: Users,
        attributes: [ "profilePicture","coverPicture","id","bio","name","lastName" ]
    }],
    where: { userId: userOwner },
    order: [[ "createdAt", "DESC" ]]
  })
  .then( ( data ) => {
    return res.status( 200 ).json( data );
  })
  .catch( ( err ) => {
    return res.status( 401 ).json({ "error": err.message });
  });
};

// Update a single Post by Id
// [PUT] http:/localhost:3500/api/post/:id
exports.updatePostById = async (req, res) => {

  const postToUpdate = parseInt( req.params.id );
  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  if ( !postToUpdate ) {
    return res.status( 400 ).json({ "error": "Indiquez le id du post a modifier" });
  }

  try {
 
    const foundPost = await Posts.findByPk( postToUpdate );

    if (  !(idOfRequestingUser === foundPost.userId ||
      roleOfRequestingUser === ROLES_LIST.admin) ) {
      return res.status( 401 ).json({ "error":"Pas de privileges nécessaires" });
    }

    if ( foundPost && (req.file || req.body.content) ) {
      if (
        idOfRequestingUser === foundPost.userId ||
        roleOfRequestingUser === ROLES_LIST.admin
      ) {
        if ( req.file ) {
          if ( req.mimetypeError ) {
            return res.status( 400 ).json({"error":"Erreur: le fichier n'est pas dans un format valide: png, jpg, webp, gif ou jpeg"});
          }

          //Getting new url
          const sentImageUrl = `${req.protocol}://${req.get("host")}/images/posts/${req.file.filename}`;

          // Getting old url
          const oldFileName = foundPost.attachement.split("/images/posts")[1];

          // Set object to update
          let infoToUpdate = req.body.content
            ? { attachement: sentImageUrl, content: req.body.content }
            : { attachement: sentImageUrl };

          // Erase old Image and update
          // Removing old file image and updating sauce
          fs.unlink( `images/posts/${oldFileName}`, 
            () => {
              Posts.update( infoToUpdate , {
              where: { id: foundPost.id }
              })
              .then( () => {
                return res.status( 200 ).json({ "message": "Objet modifié" });
              })
              .catch( ( err ) => {
                return res.status( 400 ).json({ "error": err.message })
              });
          });
        } else {
          Posts.update({ content: req.body.content },
            { where: { id: foundPost.id }
          })
          .then( () => {
            return res.status( 200 ).json({ "message": "Objet modifié" });
          })
          .catch( ( err ) => {
            return res.status( 400 ).json({ "error": err.message })
          });
        }
      } else {
        return res.status( 401 ).json({ "error": "Vous n'avez pas les privileges nécessaires" });
      }
    } else {
      return res.status( 400 ).json({ "error": "Manque d'elements pour modifier la publication." });
    }
  } catch ( err ) {
    return res.status( 500 ).json({ "DataBaseError": err.message });
  }
};

// Like / dislike handler
// [POST] http:/localhost:3500/api/post/:id/like
exports.postLikePost = (req, res) => {

  const idPostLiked = parseInt( req.params.id );
  const userLike = req.body.userId;
  const requestingUser = req.userId;

  if ( userLike !== requestingUser ) {
    return res.status( 401 ).json({ "error": "vous n'est pas authorisé" });
  }

  // Find like

  Posts.findByPk( idPostLiked )
    .then( ( post ) => {

      if ( post ) {

        Users.findByPk( userLike )
        .then( ( user ) => {
          post.hasUser( user )
          .then( ( isLiked ) => {
            if ( isLiked ) {
              return post.removeUser( user )
              .then( () => {
                Posts.decrement(
                  { totalLikes: 1 },
                  { where: { id: idPostLiked }}
                )
                .then( ( data ) => {
                  return res.status(200).json({ "message": data });
                });
              });
            } else {
              return post.addUser( user )
              .then( () => {
                return Posts.increment(
                  { totalLikes: 1 },
                  { where: { id: idPostLiked } }
                )
              })
              .then( ( data ) => {
                  return res.status( 200 ).json({ "message": data });
              });
            }
          });
        });

      } else {
        return res.status( 404 ).json({ "error": "Publication non trouvée" });
      }

    })
    .catch( ( err ) => {
      return res.status( 500 ).json({ "DataBaseError": err.message });
    });
};

// Get Likes
// [GET] http:/localhost:3500/api/post/:id/like
exports.getUserLikePost = (req, res) => {

  const isPostLiked = req.params.id;

  Posts.findByPk( isPostLiked )
  .then( ( post ) => {

      if ( post ) {
        return post.hasUser( req.userId )
        .then( ( result ) => {
          return res.status( 200 ).json({ "message": result })
        })
      } else {
        return res.status( 404 ).json( "message", "Publiaction non trouvée" );
      }

  })
  .catch( ( err ) => {
    return res.status( 500 ).json({ "DataBaseError": err.message });
  });
};

// Delete a post by id
// [DELETE] http:/localhost:3500/api/post/:id
exports.removePost = (req, res) => {

  if ( !req.params.id ) {
    return res.status( 400 ).json({ "error": "Requête erronée" });
  } else {
    const postToDelete = req.params.id;
    const requestingUser = req.userId;
    const roleOfRequestingUser = req.role;

    Posts.findOne({
      where: {
        id: postToDelete,
      },
    })
    .then( ( post ) => {

      if ( !post ) {
          return res.status( 404 ).json({"message": "Publication pas trouvée"})
      }

      if (post.userId === requestingUser ||
          roleOfRequestingUser === ROLES_LIST.admin
      ) {

        if ( post.attachement ) {

            //Delete old image
            const filename = post.attachement.split("/images/posts")[1];

            fs.unlink(`images/posts${filename}`,
              () => {
                Posts.destroy({
                  where: {
                    id: postToDelete,
                  },
                })
                .then( () => {
                  return res.status( 200 ).json({ "message": "Object supprimé" })
                })
                .catch( ( err ) => {
                  return res.status( 500 ).json({ "DataBaseError": err.message })
                });
              }
            );

        } else {

          Posts.destroy({
            where: {
              id: postToDelete,
            },
          })
          .then( () => {
            return res.status( 200 ).json({ "message": "Elément supprimé" });
          })
          .catch( ( err ) => {
            return res.status( 500 ).json({ "DataBaseError": err.message });
          });
        
        }

      } else {
          return res.status( 401 ).json({"error":"Action non autorisée"});
        }
    })
    .catch( ( err ) => {
      return res.status( 500 ).json({ "DataBaseError": err.message })
    });
  }
};
