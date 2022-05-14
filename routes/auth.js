const express = require("express");
const authRole =  require('../middleware/is-auth');

const authController = require("../controllers/auth");
//const limitRate = require("../middleware/limit-rate");

const router = express.Router();

// Sign up Route
//router.post("/signup", limitRate, userController.postSignup);
router.post("/signup", authController.postSignUp);

// Login Route
//router.post("/login", limitRate, userController.postLogin);
router.post("/login", authController.postLogin);

// LogOut Route
//router.post("/login", limitRate, userController.postLogin);
router.post("/logout", authRole(['user', 'admin']), authController.postLogout);

module.exports = router;
