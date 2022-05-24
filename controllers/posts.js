const Posts = require("../models/Post");
const Users = require("../models/User");

// Add a post
// [POST] http://localhost:3000/api/posts/
// Body Content Expected: {requestingUserId, post: {attachement?, content?, userId}} | {req.file}
exports.addPost = (req, res) => {

  console.log(req.file, req.body);
  res.status(200).json({'message': 'hecho'});
  /*
  let sentImageUrl;

  if (req.file) {
    // Getting file name
    sentImageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
    // If the image sauce is not of the correct mimetype return error.
    if (req.mimetypeError) {
      return res.status(400).json({
        message:
          "Erreur: le fichier n'est pas dans un format valide: png, jpg ou jpeg",
      });
    }
  }

  Posts.create({
    attachement: sentImageUrl,
    content: req.body.post.content,
    userIdUsers: req.body.post.userId,
  })
    .then(() => {
      res.status(200).json({ message: "Publication ajoutée!" });
    })
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });*/
};

// Get all Posts
// [GET]  http://localhost:3000/api/posts
exports.getAllPosts = (req, res) => {
  Posts.findAll({ include: Users, order: [["createdAt", "DESC"]] })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(401).json({ error: err.message });
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
exports.updatePostById = (req, res) => {
  const postToUpdate = req.params.id;
};

// Like / dislike handler
// [POST] http://localhost:3000/api/posts/:id/like
exports.postLikePost = (req, res) => {};

// Delete a post by id
// [DELETE] http://localhost:3000/api/posts/:id
exports.removePost = (req, res) => {};
