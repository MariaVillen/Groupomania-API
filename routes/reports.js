const express = require("express");
const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');
const reportController = require("../controllers/reports");
const ROLES_LIST = require('../utils/roles_list');

const router = express.Router();

//http:/localhost:3000/api/report
router.get("/", isAuth, verifyRoles([ROLES_LIST.admin]), reportController.getAllReports);
//http:/localhost:3000/api/report/:id
router.get("/:id", isAuth, verifyRoles([ROLES_LIST.admin]), reportController.getReportById);

router.post("/", isAuth, verifyRoles([ROLES_LIST.user, ROLES_LIST.admin]), reportController.addReport);

router.put("/:id", isAuth, verifyRoles([ROLES_LIST.admin]), reportController.updateReport);
router.delete("/:id", isAuth, verifyRoles([ROLES_LIST.admin]), reportController.deleteReport);

module.exports = router;
