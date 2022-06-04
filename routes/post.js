const express = require("express");

const ROLES_LIST = require('../utils/roles_list');

const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');
const upload = require("../middleware/multer-config");

const postController = require("../controllers/posts");

const router = express.Router();

// [POST] http:/localhost:3500/api/post
router.post("/", upload.single('image'), postController.addPost);

// [GET] http:/localhost:3500/api/post
router.get('/', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.getAllPosts); 

// [GET] http:/localhost:3500/api/post/topten
router.get('/topten', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.getAllPostsTopTen); 

// [GET] http:/localhost:3500/api/post/:id
router.get("/:id",isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.getPostById);

// [GET] http:/localhost:3500/api/post/user/:id
router.get("/user/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.getPostByUserId);

// [PUT] http:/localhost:3500/api/post/:id
router.put('/:id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), upload.single('image'),postController.updatePostById);

// [POST] http:/localhost:3500/api/post/:id/like
router.post ('/:id/like', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.postLikePost); // User make a like, dislike

// [GET] http:/localhost:3500/api/post/:id/like
router.get('/:id/like', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.getUserLikePost);

// [DELETE] http:/localhost:3500/api/post/:id
router.delete('/:id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.removePost);


module.exports = router;
