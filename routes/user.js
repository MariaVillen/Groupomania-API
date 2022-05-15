const express = require("express");
const userController = require("../controllers/user");
const authRole =  require('../middleware/is-auth');

const router = express.Router();

//http:/localhost:3000/api/user/
router.get("/", authRole(['user', 'admin']), userController.getAllUsers);

//http:/localhost:3000/api/user/:id
router.get("/:id", authRole(['user', 'admin']), userController.getUserById);

//http:/localhost:3000/api/user/:id
router.put("/:id", authRole(['user', 'admin']), userController.updateUser);

//http:/localhost:3000/api/user/:id
router.delete("/:id", authRole(['user','admin']), userController.deleteUser);


module.exports = router;
