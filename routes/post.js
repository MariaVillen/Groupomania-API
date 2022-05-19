const express = require("express");
const postController = require("../controllers/posts");
const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');
const ROLES_LIST = require('../utils/roles_list');

const router = express.Router();

router.post('/add', isAuth,  verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.addPost); // User add a Sauce to the DB
router.get('/', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.getAllPosts); // User add a Sauce to the DB
router.get("/:id",isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.getPostById);
router.get("/user/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.getPostByUserId);
router.put('/:id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.updatePostById);
router.post ('/:id/like', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.postLikePost); // User make a like, dislike
router.delete('/:id', isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), postController.removePost);


module.exports = router;

//Get all post by User Id 


// const express = require('express');

// const productController = require('../controllers/products');
// const isAuth = require('../middleware/is-auth');
// const multer = require('../middleware/multer-config.js');

// const router = express.Router();

// router.post ('/:id/like', isAuth, productController.postLikeSauce); // User make a like, dislike
// router.get('/:id', isAuth, productController.getSauceById); // User get a sauce detail
// router.put('/:id', isAuth, multer, productController.putUpdateSauce); // User modify the sauce
// router.delete('/:id', isAuth, productController.deleteSauce); // User remove the sauce
// router.get('/', isAuth, productController.getAllSauces); // User get all sauces from DB
// router.post('/', isAuth, multer, productController.postAddSauce); // User add a Sauce to the DB

// module.exports = router;