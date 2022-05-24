const express = require("express");
const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');
const reportController = require("../controllers/auth");
const ROLES_LIST = require('../utils/roles_list');

const router = express.Router();

//http:/localhost:3000/api/report
router.get("/", isAuth, authRole([ROLES_LIST.admin]), reportController.getAllReports);
//http:/localhost:3000/api/report/:id
router.get("/:id", isAuth, authRole([ROLES_LIST.admin]), reportController.getReportById);
router.put("/:id", isAuth, authRole([ROLES_LIST.admin]), reportController.updateReport);
router.delete("/:id", isAuth, authRole([ROLES_LIST.admin]), reportController.deleteReport);

//http:/localhost:3000/api/report/post/:id
router.post("/post/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), reportController.addReportOnPost);

//http:/localhost:3000/api/report/comment/:id
router.post("/comment/:id", isAuth, verifyRoles([ROLES_LIST.user,ROLES_LIST.admin]), reportController.addReportOnComment);

module.exports = router;
