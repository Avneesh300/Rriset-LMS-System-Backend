const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

  const upload = require("../middleware/uploadMiddleware");

const {
  generateSignedUpload,
} = require(
  "../controllers/upload.controller"
);

router.post(
  "/signed-upload",
   upload.none(),
  authMiddleware,
  generateSignedUpload
);

module.exports = router;