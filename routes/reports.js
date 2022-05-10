const express = require("express");
const reportController = require("../controllers/auth");

const router = express.Router();

router.get("/", reportController.getAllReports);
router.get("/:id", reportController.getReportById);
router.put("/:id", reportController.updateReport);
router.delete("/delete", reportController.deleteReport);
router.post("/post/:postId", reportController.addReportOnPost);
router.post("/comment/:commentId", reportController.addReportOnComment);

module.exports = router;
