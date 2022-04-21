const express = require("express");

const userController = require("../controllers/users");
const limitRate = require("../middleware/limit-rate");

const router = express.Router();

// Sign up Route
router.post("/signup", limitRate, userController.postSignup);

// Login Route
router.post("/login", limitRate, userController.postLogin);

module.exports = router;
