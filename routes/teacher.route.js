const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const {
    createTeacher,
    getAllTeacher,
    deleteTeacher,
    assignTeacherClass,
} = require("../controllers/teacher.controller.js");

router.post(
    "/create",
    upload.none(),
    authMiddleware,
    createTeacher
);

router.post(
    "/getall",
    upload.none(),
    authMiddleware,
    getAllTeacher
);

router.post(
    "/delete",
    upload.none(),
    authMiddleware,
    deleteTeacher
);

router.post(
    "/assignclass",
    upload.none(),
    authMiddleware,
    assignTeacherClass
);

module.exports = router;