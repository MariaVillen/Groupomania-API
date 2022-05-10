const Posts = require("../models/Post");
const Users = require("../models/User");
const Comments = require("../models/Comment");

//router.post('/add', postController.addComment); // User add a Sauce to the DB
exports.addComment = (req, res) => {
  Comments.create(req.body)
    .then((result) => {
      console.log(result);
      res.status(200).send(`${JSON.stringify(result)} Created!`);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

//router.get('/', postController.getAllComments); // User add a Sauce to the DB
exports.getAllComments = (req, res) => {
  Posts.findAll({ include: [Users, Posts],  order: [
    ['createdAt', 'DESC'],
] })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(401).send(err);
    });
};

//router.get("/:id", postController.getCommentById);
exports.getCommentById = (req, res) => {
 Comments.findOne({ where: {id: req.params.id} })
.then((data) => {
    res.status(200).send(data);
})
.catch((err) => {
    res.status(401).send(err);
}); 
}

//router.get('/:userId', postController.getCommentsByUserId); // User add a Sauce to the DB
exports.getCommentByUserId = (req, res) => {
Comment.findAll({ include: Users, where: {userId: req.params.id, order: [
  ['createdAt', 'DESC'],
] })
  .then((data) => {
    res.status(200).send(data);
  })
  .catch((err) => {
    res.status(401).send(err);
  });
}

//router.get('/:postId', commentController.getCommentByPost);
exports.getCommentByPost = (req, res) => {
    Comment.findAll({ include: [Users, Posts], where: {postId: req.params.id}})
        .then((data) => {
          res.status(200).send(data);
        })
        .catch((err) => {
          res.status(401).send(err);
        });
      }
}

//router.put('/:id', postController.updateCommentById);
exports.updateCommentById = (req, res) => {
}

//router.post ('/:id/like', postController.postLikeComment); // User make a like, dislike
exports.postLikeComment = (req, res) => {}

//router.delete('/:id', postController.removeComment);
exports.removeComment = (req, res) => {}



