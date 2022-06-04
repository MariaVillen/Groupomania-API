const express = require("express");
const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");
const verifyRoles = require("../middleware/verify-roles");
const upload = require("../middleware/multer-config");
const ROLES_LIST = require("../utils/roles_list");

const router = express.Router();

// [GET] http:/localhost:3500/api/user/
router.get("/",isAuth,verifyRoles([ROLES_LIST.user, ROLES_LIST.admin]),userController.getAllUsers);

// [GET] http:/localhost:3500/api/user/:id
router.get("/:id",isAuth,verifyRoles([ROLES_LIST.user, ROLES_LIST.admin]),userController.getUserById);

// [PUT] http:/localhost:3500/api/user/:id
router.put("/:id",isAuth,verifyRoles([ROLES_LIST.user, ROLES_LIST.admin]),
  upload.fields([
    { name: "cover", maxCounts: 1 },
    { name: "avatar", maxCounts: 1 },
  ]),
  userController.updateUser
);

// [DELETE] http:/localhost:3500/api/user/:id
router.delete("/:id",isAuth,verifyRoles([ROLES_LIST.user, ROLES_LIST.admin]),userController.deleteUser);

// [POST] http://localhost:3500/api/user/:id/follows
router.post('/:id/follows', isAuth, verifyRoles([ROLES_LIST.user, ROLES_LIST.admin]), userController.postFollowsHandler);

// [GET] http://localhost:3500/api/user/:id/follows
router.get('/:id/follows', isAuth, verifyRoles([ROLES_LIST.user, ROLES_LIST.admin]), userController.getUserFollows);

module.exports = router;
