const express = require("express");
const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');
const ROLES_LIST = require('../utils/roles_list');

const commentController = require("../controllers/comments");

const router = express.Router();

router.post('/add', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.addComment); // User add a Sauce to the DB
router.get('/user/id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.getCommentsByUserId); // User add a Sauce to the DB
router.get('/:postId', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.getCommentByPost);
router.get("/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.getCommentById);
router.put('/:id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.updateCommentById);
router.post ('/:id/like', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.postLikeComment); // User make a like, dislike
router.delete('/:id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.removeComment);


module.exports = router;

