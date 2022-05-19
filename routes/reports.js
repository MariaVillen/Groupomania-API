const express = require("express");
const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');
const reportController = require("../controllers/auth");
const ROLES_LIST = require('../utils/roles_list');

const router = express.Router();

router.get("/", isAuth, authRole([ROLES_LIST.admin]), reportController.getAllReports);
router.get("/:id", isAuth, authRole([ROLES_LIST.admin]), reportController.getReportById);
router.put("/:id", isAuth, authRole([ROLES_LIST.admin]), reportController.updateReport);
router.delete("/:id", isAuth, authRole([ROLES_LIST.admin]), reportController.deleteReport);
router.post("/post/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), reportController.addReportOnPost);
router.post("/comment/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), reportController.addReportOnComment);

module.exports = router;
