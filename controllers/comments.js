const Posts = require("../models/Post");
const Users = require("../models/User");
const Comments = require("../models/Comment");



// router.post('/add', postController.addComment); // User add a Sauce to the DB
// [POST] http://localhost:3000/comments/add
// Body: {idUser: idOfRequesterUser, comment: { content, postId, userId}}
exports.addComment = (req, res) => {

    const idOfRequesterUser = req.idUser;

  // Get comment text, userId Author, post Id of the comment.

    Comments.create({
      content: "name",
      postIdPost: "text",
      userIdusers: idUser
    })
    .then((result) => {
      console.log(result);
      res.status(200).send(`${JSON.stringify(result)} Created!`);
    })
    .catch((err) => {
      res.status(400).send(err.message);
    });
};

//router.get('/', postController.getAllComments); 
//TODO: necesario? Hacer si lo es
exports.getAllComments = (req, res) => {
  Comments.findAll({ include: [Users, Posts], order: [["createdAt", "DESC"]] })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(401).send(err);
    });
};

//TODO: Necesario? Hacer si lo es.
//router.get("/:id", postController.getCommentById);
exports.getCommentById = (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({Error: "Indiquez l'id de l'utilisateur"})
  } 

  Comments.findOne({ where: { idComment: req.params.id } })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(401).send(err);
    });
};

//router.get('/:userId', postController.getCommentsByUserId); // User add a Sauce to the DB
exports.getCommentByUserId = (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({Error: "Indiquez l'id de l'utilisateur"})
  } 

  Comments.findAll({
    include: Comments,
    where: { userId: userId },
    order: ["createdAt", "DESC"],
  })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(401).send(err);
    });
};

//router.get('/:postId', commentController.getCommentByPost);
exports.getCommentByPost = (req, res) => {
  Comments.findAll({
    include: [Users, Posts],
    where: { postId: req.params.id },
  })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(401).send(err);
    });
};

//router.put('/:id', postController.updateCommentById);
exports.updateCommentById = (req, res) => {

  const content = req.body.comment.content;
  const commentUser = req.body.comment.userId;

  if (!content || !commentUser || !userId) {
    return res.status(400).json({Error: "Parametres manquantes."});
  }

  // Verify if it is admin or a user who updates his own comment.
  if (role === 'admin' || userRequester === userId) {
    Comments.update({content}, {
      where: { commentId: commentId}})
};

//router.post ('/:id/like', postController.postLikeComment); // User make a like, dislike
exports.postLikeComment = (req, res) => {};

//router.delete('/:id', postController.removeComment);
exports.removeComment = (req, res) => {
  const commentId = req.params.userId;

  if (!commentId) {
    return res.status(400).json({Error: "Indiquez l'id de l'utilisateur"})
  } 

  const role = req.userRole;
  const userRequester = req.userIdReq;
  const userComment = req.body.comment.userId;

  // Verify if it is admin or a user who deletes his own comment.
  if (role === 'admin' || userRequester === userId) {

    Comments.destroy({
      where: {
        idComment: commentId,
        userIdUsers: userId // verify that the userId is the author of the comment.
      }
    })
    .then(()=>{
      res.status(200).json({message: "Commentaire supprimé"});
    })
    .catch((err)=>{
      res.status(500).json({DataBaseError: err.message});
    })
  } else {
    return res.status(400).json({message: "Vous devez être administrateur ou le propietaire du commentaire pour lui effacer."});
  }
};
