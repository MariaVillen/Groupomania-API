const Posts = require("../models/Post");
const Users = require("../models/User");
const Comments = require("../models/Comment");
const ROLES_LIST = require("../utils/roles_list");


// Add a comment
// [POST] http://localhost:3500/comment/add

exports.addComment = (req, res) => {

  const idOfRequesterUser = req.userId;
  const content = req.body.content;
  const postId = req.body.postId;

  if ( !content || !postId ) {
    return res.status( 400 ).json({ "error": "Eléments manquantes" });
  }
  // Get comment text, userId Author, post Id of the comment.
  Comments.create({
    content: req.body.content,
    postId: postId,
    userId: idOfRequesterUser,
  })
  .then( ( result ) => {
    Posts.increment(
      { totalComments: 1 },
      { where: { id: postId } }
    ).then( () => {
      return res.status( 200 ).json({"message": result});
    });
  })
  .catch( ( err ) => {
    return res.status( 400 ).json({"error": err.message });
  });
};

// Get all the comments of a post.
// [POST] http://localhost:3500/comment/:id
exports.getCommentByPost = (req, res) => {

  const postId = req.params.postId;

  if ( !postId ) {
    return res.status( 400 ).json({ "error": "Indiquez l'id de la publication" });
  }

  Comments.findAll({
    include: [ Users ],
    where: { postId: postId },
  })
  .then( ( data ) => {
    return res.status( 200 ).json( data );
  })
  .catch( ( err ) => {
    return res.status(500).json({ "error": err.message });
  });
};

// Modify a comment
// [PUT] http://localhost:3500/comment/:id
exports.updateCommentById = (req, res) => {

  const commentId = req.params.id;
  const content = req.body.content;
  const requiringRole = req.role;
  const requestingUser = req.userId;

  if ( !content || !commentId ) {
    return res.status( 400 ).json({ "error": "Parametres manquantes." });
  } else {
    Comments.findByPk( commentId )
    .then( ( comment ) => {
      if ( !comment ) {
        return res.status( 400 ).json({ "error": "parametres manquantes" });
      } else if ( requestingUser !== comment.userId || requiringRole !== ROLES_LIST.admin) {
        return res.status( 401 ).json({ "error": "Sans privileges" });
      } else {
        return comment;
      }
    })
    .then((comment) => {
        // Verify if it is admin or a user who updates his own comment.
      if ( req.role !== ROLES_LIST.admin || requestingUser !== comment.userId) {
          return res.status(401).json({ error: "Action non autorisée" });
      } else {
        return comment;
      }
    })
    .then(() => {
      Comments.update({ content },
        { where: { id: commentId } }
      );
    })
    .then(() => {
      return res.status( 200 ).json({ "message": "Commentaire modifié" });
    })
    .catch( ( err ) => {
      return res.status( 500 ).json({ "DataBaseError": err.message });
    });
  }
};


// Add like or unlike a comment
// [POST] http://localhost:3500/comment/:id/like
exports.postLikeComment = (req, res) => {

  const idCommentLiked = parseInt( req.params.id );
  const userLike = req.body.userId;
  const requestingUser = req.userId;
  
  if ( userLike !== requestingUser ) {
    return res.status(401).json({ error: "vous n'est pas authorisé" });
  }
  
  // Find like
    Comments.findByPk( idCommentLiked )
    .then( ( comment ) => {
      if ( comment ) {
 
        Users.findByPk( userLike )
        .then( ( user ) => {
          comment.hasUser( user )
          .then( ( isLiked ) => {  
            if ( isLiked ) {
              return post.removeUser( user )
              .then( () => {
                Comments.decrement( { likes: 1 },{  where: { id: idCommentLiked }} )
                .then( (result)=>{
                  return res.status(200).json({"message": result});
                })
              })
  
            } else {
              return comment.addUser( user )
              .then( () => {
                return Comments.increment( { likes: 1 },{  where: { id: idCommentLiked }})
              })
              .then( ( result ) => {
                return res.status(200).json({ "message": result })
              })
            }
          })
        })

      } else {
        return res.status( 404 ).json({ "error": "Publication non trouvée" })
      }
    })
    .catch( ( err ) => {
      return res.status( 500 ).json({ "error" : err.message });
    })
};

// Verify if a user has liked a comment
// [GET] http://localhost:3500/comment/:id/like
exports.getUserLikeComment = (req, res) =>{

  const isCommentLiked = req.params.id
  Comments.findByPk( isCommentLiked )
  .then( ( comment ) => {
    if ( comment ) {
      return comment.hasUser( req.userId )
      .then( ( result ) => {
        return res.status(200).json({"message": result})
      })
    } else {
      return res.status( 404 ).json({ "message": "Publiaction non trouvée" });
    }
  })
  .catch( ( err ) => {
    return res.status( 500 ).json({ "error": err.message });
  })
}

// Delete a comment
// [DELETE] http://localhost:3500/comment/:id
exports.removeComment = (req, res) => {

  const commentId = req.params.id;
  const role = req.userRole;
  const userRequester = req.userId;

  if ( !commentId ) {
    return res.status( 400 ).json({ "error": "Indiquez l'id de l'utilisateur" });
  } else {
    Comments.findOne({ where: { id: commentId } })
    .then( ( comment ) => {
      if ( !comment ) {
        return res.status( 404 ).json({ "error": "Le commentaire n'esxiste pas" });

      // Verify if it is admin or a user who deletes his own comment.
      } else if ( role === ROLES_LIST.admin || userRequester === comment.userId ) {
        const commentPostId = comment.postId;
        Comments.destroy({
          where: { id: commentId }
        })
        .then( () => {
          Posts.decrement(
            { totalComments: 1 },
            { where: { id: commentPostId }
          })
          .then( () => {
            return res.status( 200 ).json({ "message": "Commentaire supprimé" });
          })
        })
        .catch( ( err ) => {
          return res.status(500).json({ "error": err.message} );
        })

      } else {
        return res.status( 400 ).json({"error": "Vous devez être administrateur ou le propietaire du commentaire pour lui effacer."})
      }
    })
    .catch( ( err ) => {
      return res.status( 500 ).json({ "DataBaseError": err.message });
    });
  }
};
