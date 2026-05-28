const express = require("express");

const router = express.Router();

const {
  registerInstitution,
  approvedInstitution,
  rejectedInstitution,
  getAllInstitution,
  deleteInstitution
} = require("../controllers/institutionController");

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/register",
  upload.none(),
  registerInstitution
);
router.post(
  "/approved",
   upload.none(),
  authMiddleware,
  approvedInstitution
);

router.post(
  "/reject",
   upload.none(),
  authMiddleware,
  rejectedInstitution
);

router.post(
  "/all",
   upload.none(),
  authMiddleware,
  getAllInstitution
);

router.post(
  "/delete",
   upload.none(),
  authMiddleware,
  deleteInstitution
);

module.exports = router;