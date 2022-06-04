const express = require("express");
const isAuth = require("../middleware/is-auth");
const verifyRoles =  require('../middleware/verify-roles');
const reportController = require("../controllers/reports");
const ROLES_LIST = require('../utils/roles_list');

const router = express.Router();

// [GET] http://localhost:3500/report
router.get("/", isAuth, verifyRoles([ROLES_LIST.admin]), reportController.getAllReports);

// [PUT] http://localhost:3500/report/:id
router.put("/:id", isAuth, verifyRoles([ROLES_LIST.admin]), reportController.updateReport);

// [POST] http://localhost:3000/api/report
router.post("/", isAuth, verifyRoles([ROLES_LIST.user, ROLES_LIST.admin]), reportController.addReport);

//router.delete("/:id", isAuth, verifyRoles([ROLES_LIST.admin]), reportController.deleteReport);

module.exports = router;
