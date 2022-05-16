const express = require("express");
const authRole = require("../middleware/is-auth");
const commentController = require("../controllers/comments");

const router = express.Router();

router.post('/add', authRole(['user', 'admin']), commentController.addComment); // User add a Sauce to the DB
router.get('/user/id', authRole(['user', 'admin']), commentController.getCommentsByUserId); // User add a Sauce to the DB
router.get('/:postId', authRole(['user', 'admin']), commentController.getCommentByPost);
router.get("/:id", authRole(['user', 'admin']), commentController.getCommentById);
router.put('/:id', authRole(['user', 'admin']), commentController.updateCommentById);
router.post ('/:id/like', authRole(['user', 'admin']), commentController.postLikeComment); // User make a like, dislike
router.delete('/:id', authRole(['user', 'admin']), commentController.removeComment);


module.exports = router;

