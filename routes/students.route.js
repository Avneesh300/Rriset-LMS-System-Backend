const express = require("express");
const router = express.Router();
const {
    registerStudent,
    getStudents,
    deleteStudent,
    importStudents,
    exportStudents,
} = require("../controllers/student.controller.js");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/create",
    upload.none(),
    authMiddleware,
    registerStudent
);

router.post(
    "/get_students",
    upload.none(),
    authMiddleware,
    getStudents
);
router.post(
    "/update_status",
    upload.none(),
    authMiddleware,
    deleteStudent
);

router.post(
    "/importstudent",
    authMiddleware,
    upload.single("file"),
    importStudents
);

router.post(
    "/export-students",
     upload.none(),
    authMiddleware,
    exportStudents
);

module.exports = router;