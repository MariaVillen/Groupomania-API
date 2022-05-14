const Posts = require("../models/Post");
const Users = require("../models/User");

//router.post('/add', postController.addPost); // User add a Sauce to the DB
exports.addPost = (req, res) => {
  Posts.create(req.body)
    .then((result) => {
      console.log(result);
      res.status(200).send(`${JSON.stringify(result)} Created!`);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

//router.get('/', postController.getAllPosts); // User add a Sauce to the DB
exports.getAllPosts = (req, res) => {
  Posts.findAll({ include: Users, order: [["createdAt", "DESC"]] })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(401).send(err);
    });
};

//router.get("/:id", postController.getPostById);
exports.getPostById = (req, res) => {
  Posts.findOne({ where: { id: req.params.id } })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(401).send(err);
    });
};

//router.get("/:userId", postController.getPostByUserId);
exports.getPostByUserId = (req, res) => {
  Posts.findAll({
    include: Users,
    where: { userId: req.params.id },
    order: ["createdAt", "DESC"],
  })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(401).send(err);
    });
};

//router.put('/:id', postController.updatePostById);
exports.updatePostById = (req, res) => {};
//router.post ('/:id/like', postController.postLikePost); // User make a like, dislike
exports.postLikePost = (req, res) => {};

//router.delete('/:id', postController.removePost);
exports.removePost = (req, res) => {};
