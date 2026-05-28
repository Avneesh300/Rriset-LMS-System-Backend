const express = require("express");

const router = express.Router();

const {
    registerClass,
    getAllClass,
    deleteClass,
} = require("../controllers/class.controller");

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/create",
    upload.none(),
    authMiddleware,
    registerClass
);

router.post(
    "/get-all",
    upload.none(),
    authMiddleware,
    getAllClass
);

router.post(
    "/delete",
    upload.none(),
    authMiddleware,
    deleteClass
);

module.exports = router;