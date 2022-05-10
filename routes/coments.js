const express = require("express");
const commentController = require("../controllers/posts");

const router = express.Router();

router.post('/add', commentController.addComment); // User add a Sauce to the DB
router.get('/:userId', commentController.getCommentsByUserId); // User add a Sauce to the DB
router.get('/:postId', commentController.getCommentByPost);
router.get("/:id", commentController.getCommentById);
router.put('/:id', commentController.updateCommentById);
router.post ('/:id/like', commentController.postLikeComment); // User make a like, dislike
router.delete('/:id', commentController.removeComment);


module.exports = router;

