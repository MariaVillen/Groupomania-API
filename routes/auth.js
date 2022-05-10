const express = require("express");

const authController = require("../controllers/users");
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
router.post("/logout", authController.postLogout);

module.exports = router;
