const express = require("express");
const authRole = require("../middleware/is-auth");
const reportController = require("../controllers/auth");

const router = express.Router();

router.get("/", authRole(['admin']), reportController.getAllReports);
router.get("/:id", authRole(['admin']), reportController.getReportById);
router.put("/:id", authRole(['admin']), reportController.updateReport);
router.delete("/delete", authRole(['admin']), reportController.deleteReport);
router.post("/post/:postId", authRole(['user', 'admin']), reportController.addReportOnPost);
router.post("/comment/:commentId", authRole(['user', 'admin']), reportController.addReportOnComment);

module.exports = router;
