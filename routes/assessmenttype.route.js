const express = require("express");

const router = express.Router();

const {
  registerAssessmentType,
  getAllAssessmentType,
  deleteAssessmentType
} = require("../controllers/assessmentTypeController.js");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");


router.post(
  "/create",
   upload.none(),
  authMiddleware,
  registerAssessmentType
);
router.post(
  "/getall",
   upload.none(),
  authMiddleware,
  getAllAssessmentType
);
router.post(
  "/update_status",
   upload.none(),
  authMiddleware,
  deleteAssessmentType
);




module.exports = router;