const express = require("express");
const refreshTokenController = require("../controllers/refreshTokenController");

const router = express.Router();


//[GET] http:/localhost:3500/api/refresh
router.get("/", refreshTokenController.refreshTokenHandler);

module.exports = router;
