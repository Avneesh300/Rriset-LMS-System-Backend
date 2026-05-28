const express = require("express");
const router = express.Router();
const institutionRoute = require("../routes/institutionRoute");
const dropdownRoute = require("../routes/dropdownRoute");
const userRoute = require("../routes/userRoutes");
const assessmenttypeRoute = require("../routes/assessmenttype.route");
const uploadpaperRoute = require("../routes/uploadPaper.route");
const uploadRoute = require("../routes/upload.route");
const schooleRoute = require("../routes/schoole.route.js");
const classRoute = require("../routes/class.route.js");
const studentRoute = require("../routes/students.route.js");
const teacherRoute = require("../routes/teacher.route.js");
const programRoute = require("../routes/program.route.js");
const rrisetRoute = require("../routes/rriset.route.js");

router.use(
  "/institution",
  institutionRoute
);

router.use(
  "/user",
  userRoute
);
router.use(
  "/dropdown",
  dropdownRoute
);
router.use(
  "/assessmenttype",
  assessmenttypeRoute
);
router.use(
  "/uploadpaper",
  uploadpaperRoute
);

router.use(
  "/upload",
  uploadRoute
);
router.use(
  "/schoole",
  schooleRoute
);
router.use(
  "/class",
  classRoute
);
router.use(
  "/student",
  studentRoute
);
router.use(
  "/teacher",
  teacherRoute
);
router.use(
  "/program",
  programRoute
);
router.use(
  "/rriset",
  rrisetRoute
);

module.exports = router;