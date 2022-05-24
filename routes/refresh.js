const express = require("express");

const router = express.Router();
const refreshTokenController = require("../controllers/refreshTokenController");

//http:/localhost:3000/api/refresh
router.get("/", refreshTokenController.refreshTokenHandler);

module.exports = router;
