const express = require("express");

const router = express.Router();

const {
  registerUploadPaper,
  getAllUploadPaper,
  deleteAssessmentType
} = require("../controllers/uploadpaper.controller.js");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");


router.post(
  "/create",
   authMiddleware,
   upload.single("file"),
 
  registerUploadPaper
);
router.post(
  "/getall",
   upload.none(),
  authMiddleware,
  getAllUploadPaper
);
router.post(
  "/update_status",
   upload.none(),
  authMiddleware,
  deleteAssessmentType
);




module.exports = router;