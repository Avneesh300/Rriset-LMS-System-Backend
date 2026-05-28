const express = require("express");
const router = express.Router();

const {
  getGradeDropdown,
  getSectionDropdown,
  getInstitutionTypeDropdown,
  getSchoolDropdown,
  getClassDropdown,
} = require(
  "../controllers/dropdownController"
);

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/grade-dropdown",
  authMiddleware,
  getGradeDropdown
);

router.get(
  "/section-dropdown",
  authMiddleware,
  getSectionDropdown
);

router.get(
  "/institution-type-dropdown",
  authMiddleware,
  getInstitutionTypeDropdown
);
router.get(
  "/schoole-dropdown",
  authMiddleware,
  getSchoolDropdown
);
router.get(
  "/class-dropdown",
  authMiddleware,
  getClassDropdown
);


module.exports = router;