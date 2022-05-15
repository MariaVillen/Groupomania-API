const express = require("express");
const authRole =  require('../middleware/is-auth');
const limitRate = require("../middleware/limit-rate");


const authController = require("../controllers/auth");
//const limitRate = require("../middleware/limit-rate");

const router = express.Router();

// Sign up Route
//http:/localhost:3000/api/signup
router.post("/signup", limitRate, authController.postSignUp);

// Login Route
//http:/localhost:3000/api/login
router.post("/login", limitRate, authController.postLogin);

// Logout Route
//http:/localhost:3000/api/logout
router.post("/logout", authRole(['user', 'admin']), authController.postLogout);

module.exports = router;
