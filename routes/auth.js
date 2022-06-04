const express = require("express");
const authRole = require("../middleware/is-auth");
const limitRate = require("../middleware/limit-rate");
const authController = require("../controllers/auth");
//const limitRate = require("../middleware/limit-rate");

const router = express.Router();

// [POST] http:/localhost:3500/auth/signup
router.post("/signup", limitRate, authController.postSignUp);

// [POST] http:/localhost:3500/auth/login
router.post("/login", limitRate, authController.postLogin);

// [POST] http:/localhost:3500/auth/logout
router.post("/logout", authController.postLogout);

module.exports = router;
