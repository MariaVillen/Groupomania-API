const express = require("express");
const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');

const ROLES_LIST = require('../utils/roles_list');

const commentController = require("../controllers/comments");

const router = express.Router();

// [POST] http://localhost:3500/comment/add
router.post('/', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.addComment); 

// [POST] http://localhost:3500/comment/:id
router.get('/:postId', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.getCommentByPost);

// [PUT] http://localhost:3500/comment/:id
router.put('/:id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.updateCommentById);

// [POST] http://localhost:3500/comment/:id/like
router.post ('/:id/like', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.postLikeComment); // User make a like, dislike

// [GET] http://localhost:3500/comment/:id/like
router.get('/:id/like', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.getUserLikeComment);

// [DELETE] http://localhost:3500/comment/:id
router.delete('/:id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), commentController.removeComment);


module.exports = router;

