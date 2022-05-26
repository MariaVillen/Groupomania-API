const Posts = require("../models/Post");
const Users = require("../models/User");
const ROLES_LIST = require("../utils/roles_list");

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
    });}
    else {
      return res.status(400).json({"error": "Vous devez ajouter ou bien une image ou bien du texte."})
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
    order: ["createdAt", "DESC"],
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(401).json({ error: err.message });
    });
};

// TODO:

// Update a single Post by Id
// [PUT] http://localhost:3000/api/posts/:id
exports.updatePostById = async (req, res) => {
  
  const postToUpdate = parseInt(req.params.id);
  const roleOfRequestingUser = req.role;
  const idOfRequestingUser = req.userId;

  if(!postToUpdate){
    return res.status(400).json({'error':'Indiquez le id du post a modifier'});
  }

  try {
    const foundPost = await Posts.findByPk(postToUpdate);
    
    if (foundPost && (req.file || req.body.content)) {

      if ((idOfRequestingUser === foundPost.userId)||roleOfRequestingUser === ROLES_LIST.admin) {
        
        let infoToUpdate

        if (req.body.content) {
          infoToUpdate = {content: req.body.content}
        }
          
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

          infoToUpdate = {...infoToUpdate, attachement: sentImageUrl};
        }

        await Posts.update(infoToUpdate,{
          where: {
            id: postToUpdate
          }});
      
          

      } else {
        return res.status(401).json({"error": "Vous n'avez pas les privileges nécessaires"})
      } 
    } else {
      return res.status(400).json({"error": "Elements manquantes"})
    } 
  } catch (error) {
    res.status(500).json({"error": error.message});
  }

};

// Like / dislike handler
// [POST] http://localhost:3000/api/posts/:id/like
exports.postLikePost = (req, res) => {};

// Delete a post by id
// [DELETE] http://localhost:3000/api/posts/:id
exports.removePost = (req, res) => {};
