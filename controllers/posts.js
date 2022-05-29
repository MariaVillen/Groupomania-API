const Posts = require("../models/Post");
const Users = require("../models/User");
const ROLES_LIST = require("../utils/roles_list");
const fs = require("fs");
const LikesPost = require("../models/User");

// Add a post
// [POST] http://localhost:3000/api/posts/
// Body Content Expected: {requestingUserId, post: {attachement?, content?, userId}} | {req.file}
exports.addPost = (req, res) => {
  console.log(req.file, req.body);

  let sentImageUrl;

  if (req.file) {
    // Getting file name
    sentImageUrl = `${req.protocol}://${req.get("host")}/images/posts/${
      req.file.filename
    }`;
    // If the image sauce is not of the correct mimetype return error.
    if (req.mimetypeError) {
      return res.status(400).json({
        message:
          "Erreur: le fichier n'est pas dans un format valide: png, jpg, webp ou jpeg",
      });
    }
  }

  if (req.body.content || sentImageUrl) {
    Posts.create({
      attachement: sentImageUrl,
      content: req.body.content,
      userId: req.body.userId,
    })
      .then(() => {
        res.status(200).json({ message: "Publication ajoutée!" });
      })
      .catch((err) => {
        return res.status(400).json({ error: err.message });
      });
  } else {
    return res.status(400).json({
      error: "Vous devez ajouter ou bien une image ou bien du texte.",
    });
  }
};

// Get all Posts
// [GET]  http://localhost:3000/api/posts
exports.getAllPosts = (req, res) => {
  Posts.findAll({ include: Users, order: [["createdAt", "DESC"]] })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Get Posts By Id
// [GET] http://localhost:3000/api/posts/:id
exports.getPostById = (req, res) => {
  const postToGet = req.params.id;
  // Verify if the user id exists in the params of the GET request.
  if (!postToGet) {
    return res.status(400).json({ error: "Indiquez l'id de l'utilisateur" });
  }

  Posts.findOne({ where: { id: postToGet } })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(401).json({ error: err.message });
    });
};

// Get Post from a single user
// [GET] http://localhost:3000/api/posts/user/:id
exports.getPostByUserId = (req, res) => {
  const userOwner = req.params.id;
  // Verify if the user id exists in the params of the GET request.
  if (!userOwner) {
    return res.status(400).json({ error: "Indiquez l'id de l'utilisateur" });
  }

  Posts.findAll({
    include: Users,
    where: { userId: userOwner },
    order: [["createdAt", "DESC"]],
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(401).json({ error: err.message });
    });
};

// Update a single Post by Id
// [PUT] http://localhost:3000/api/posts/:id
exports.updatePostById = async (req, res) => {
  const postToUpdate = parseInt(req.params.id);
  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  if (!postToUpdate) {
    return res.status(400).json({ error: "Indiquez le id du post a modifier" });
  }

  try {
    const foundPost = await Posts.findByPk(postToUpdate);

    if (foundPost && (req.file || req.body.content)) {
      if (
        idOfRequestingUser === foundPost.userId ||
        roleOfRequestingUser === ROLES_LIST.admin
      ) {
        if (req.file) {
          if (req.mimetypeError) {
            return res.status(400).json({
              message:
                "Erreur: le fichier n'est pas dans un format valide: png, jpg, webp ou jpeg",
            });
          }

          //Getting new url
          const sentImageUrl = `${req.protocol}://${req.get(
            "host"
          )}/images/posts/${req.file.filename}`;

          // Getting old url
          const oldFileName = foundPost.attachement.split("/images/posts")[1];

          // Set object to update
          let infoToUpdate = req.body.content
            ? { attachement: sentImageUrl, content: req.body.content }
            : { attachement: sentImageUrl };

          // Erase old Image and update
          // Removing old file image and updating sauce
          fs.unlink(`images/posts/${oldFileName}`, () => {
            Posts.update(infoToUpdate, {
              where: {
                id: foundPost.id,
              },
            })
              .then(() => {
                res.status(200).json({ message: "Objet modifié" });
              })
              .catch((err) =>
                res.status(400).json({ message: "Erreur: " + err })
              );
          });
        } else {
          Posts.update(
            { content: req.body.content },
            {
              where: {
                id: foundPost.id,
              },
            }
          )
            .then(() => {
              res.status(200).json({ message: "Objet modifié" });
            })
            .catch((err) =>
              res.status(400).json({ message: "Erreur: " + err })
            );
        }
      } else {
        return res
          .status(401)
          .json({ error: "Vous n'avez pas les privileges nécessaires" });
      }
    } else {
      return req
        .status(400)
        .json({ error: "Manque d'elements pour modifier la publication." });
    }
  } catch (err) {
    req.status(500).json({ DataBaseError: err.message });
  }
};

// TODO:
// Like / dislike handler
// [POST] http://localhost:3000/api/posts/:id/like
exports.postLikePost = (req, res) => {
  const idPostLiked = parseInt(req.params.id);
  const userLike = req.body.userId;
  const requestingUser = req.userId;
  console.log (idPostLiked, userLike, requestingUser);

  if (userLike !== requestingUser) {
    return res.status(401).json({ error: "vous n'est pas authorisé" });
  }

  // Find like

    Posts.findOne({
    where: {id: idPostLiked},
    include: [{
      model: Users,
      through: {
        where: {userId: userLike}
      }
    }]
    }).then(
      (like)=>{
        if (like) {
          // LIKE
          Posts.removeUsers(Users, { through: { idUser: userLike }})
          .then(() => {
          // Décrement likes on Post
              Posts.decrement(
                { likes: 1 },
                {
                  where: {
                    id: idPostLiked,
                  },
                }
              );
              res.status(204).json("message", "Element supprimé");
            })
            .catch((err) => res.status(500).json({ DataBaseError: err.message }));
        } else {
          // UNLIKE
          Posts.addUsers(Users, { through: { idUser: userLike, postId:idPostLiked }})
            .then(() => {
              // Décrement likes on Post
              Posts.increment(
                { likes: 1 },
                {
                  where: {
                    id: idPostLiked,
                  },
                }
              );
              res.status(204).json("message", "Element ajouté");
            })


        }
      }
    )
     .catch((err) => res.status(500).json({ DataBaseError: err.message }));
  }


// Delete a post by id
// [DELETE] http://localhost:3000/api/posts/:id
exports.removePost = (req, res) => {

  if (!req.params.id) {
    res.status(400).json({'Error':'Requête erronée'});
  } else {

    const postToDelete = req.params.id;
    const requestingUser = req.userId;
    const roleOfRequestingUser = req.role;

    Posts.findOne({where: {
      id: postToDelete
    }})
    .then((post)=>{

      if (!post) {
        return res.status(404).json("Publication pas trouvée");
      } 

      if ((post.userId === requestingUser) || roleOfRequestingUser ===ROLES_LIST.admin) {
        if (post.attachement) {
          //Delete old image

          const filename = post.attachement.split("/images/posts")[1];

          fs.unlink(`images/posts${filename}`, ()=> {
            Posts.destroy({
              where: {
                id: postToDelete
              }
            })
            .then(()=>{
              res.status(200).json({'message':'Object supprimé'});
            })
            .catch((err) => {
              res.status(500).json({"DataBaseError": err.message});
            })
          })
          
        } else {

          Posts.destroy({
            where:{
              id: postToDelete
            }
          })
          .then(()=>{res.status(200).json({"message":"Elément supprimé"}
          )})
          .catch((err)=>{res.status(500).json({"DataBaseError": err.message})})
        }
      } else {
        return res.status(401).json("Action non autorisée");
      }

    })
    .catch((err)=>{ res.status(500).json({"DataBaseError":err.message})});


  }


};
