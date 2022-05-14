const express = require("express");
const userController = require("../controllers/user");
const authRole =  require('../middleware/is-auth');

const router = express.Router();

router.get("/", authRole(['user', 'admin']), userController.getAllUsers);
router.get("/:id", authRole(['user', 'admin']), userController.getUserById);
router.put("/:id", authRole(['user', 'admin']), userController.updateUser);
router.delete("/delete", authRole(['user','admin']), userController.deleteUser);

module.exports = router;
