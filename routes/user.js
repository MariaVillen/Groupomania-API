const express = require("express");
const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');
const multer = require("multer");
const upload = require("../middleware/multer-config");
const ROLES_LIST = require('../utils/roles_list');

const router = express.Router();

//http:/localhost:3000/api/user/
router.get("/", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), userController.getAllUsers);

//http:/localhost:3000/api/user/:id
router.get("/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), userController.getUserById);

//http:/localhost:3000/api/user/:id
router.put("/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), upload.fields([{name:'cover', maxCounts: 1}, {name:"avatar", maxCounts: 1}]), userController.updateUser);

//http:/localhost:3000/api/user/:id
router.delete("/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), userController.deleteUser);

module.exports = router;

