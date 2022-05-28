const Posts = require("../models/Post");
const Users = require("../models/User");
const Comments = require("../models/Comment");
const ROLES_LIST = require("../utils/roles_list");

// router.post('/add', postController.addComment); // User add a Sauce to the DB
// [POST] http://localhost:3000/comments/add
// Body: {idUser: idOfRequesterUser, comment: { content, postId, userId}}
exports.addComment = (req, res) => {
  const idOfRequesterUser = req.userId;
  const content = req.body.content;
  const postId = req.body.postId;

  if (!content || !postId) {
    res.status(400).json({ error: "Eléments manquantes" });
  }
  // Get comment text, userId Author, post Id of the comment.
  Comments.create({
    content: req.body.content,
    postId: postId,
    userId: idOfRequesterUser,
  })
    .then((result) => {
      console.log(result);
      Posts.increment(
        { totalComments: 1 },
        {
          where: { id: postId },
        }
      ).then(() => {
        res.status(200).send(`${JSON.stringify(result)} Created!`);
      });
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
    return res.status(400).json({ error: "Indiquez l'id de l'utilisateur" });
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
    return res.status(400).json({ error: "Indiquez l'id de l'utilisateur" });
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
  const postId = req.params.postId;
  if (!postId) {
    return res.status(400).json({ error: "Indiquez l'id de la publication" });
  }
  Comments.findAll({
    include: [Users],
    where: { postId: postId },
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
  const commentId = req.params.id;
  const content = req.body.content;
  const requiringRole = req.role;
  const requestingUser = req.userId;

  if (!content || !commentId) {
    return res.status(400).json({ Error: "Parametres manquantes." });
  } else {
    Comments.findByPk(commentId)
      .then((comment) => {
        if (!comment) {
          return res.status(400).json({ error: "parametres manquantes" });
        } else if (
          requestingUser !== comment.userId ||
          requiringRole !== ROLES_LIST.admin
        ) {
          return res.status(401).json({ error: "Sans privileges" });
        } else {
          return comment;
        }
      })
      .then((comment) => {
        // Verify if it is admin or a user who updates his own comment.
        if (
          req.role !== ROLES_LIST.admin ||
          requestingUser !== comment.userId
        ) {
          return res.status(401).json({ error: "Action non autorisée" });
        } else {
          return comment;
        }
      })
      .then((comment) => {
        Comments.update(
          { content },
          {
            where: { id: commentId },
          }
        );
      })
      .then((result) => {
        return res.status(200).json({ Message: "Commentaire modifié" });
      })
      .catch((err) => {
        return res.status(500).json({ DataBaseError: err.message });
      });
  }
};

//router.post ('/:id/like', postController.postLikeComment); // User make a like, dislike
exports.postLikeComment = (req, res) => {};

//router.delete('/:id', postController.removeComment);
exports.removeComment = (req, res) => {

  const commentId = req.params.id;
  const role = req.userRole;
  const userRequester = req.userId;

  console.log("hola soy remove comment");

  if (!commentId) {
    return res.status(400).json({ Error: "Indiquez l'id de l'utilisateur" });
  } else {
    Comments.findOne({ where: { id: commentId } })
    .then((comment) => {
      if (!comment) {
        return res
          .status(404)
          .json({ error: "Le commentaire n'esxiste pas" });
          // Verify if it is admin or a user who deletes his own comment.
      } else if (
        role === ROLES_LIST.admin ||
        userRequester === comment.userId
        ) {
          const commentPostId = comment.postId;
          Comments.destroy({
            where: {
              id: commentId,
            }
          })
          .then(() => {
            console.log(commentPostId);
            Posts.decrement(
              { totalComments: 1 },
              {
                where: { id: commentPostId },
              }
            )
            .then(() => {
              return res.status(200).json({ "message": "Commentaire supprimé" });
            })
          })
          .catch((err)=> {
            return res.status(500).json({"error": err.message});
          })
        } else {
          return res
            .status(400)
            .json({
              message:
                "Vous devez être administrateur ou le propietaire du commentaire pour lui effacer.",
            });
        }
      })
      .catch((err) => {
        res.status(500).json({ DataBaseError: err.message });
      });
  }
};
