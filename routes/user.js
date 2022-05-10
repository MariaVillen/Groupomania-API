const express = require("express");
const userController = require("../controllers/auth");

const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/delete", userController.deleteUser);

module.exports = router;
