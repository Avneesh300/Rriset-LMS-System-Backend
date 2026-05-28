const express = require("express");
const router = express.Router();
const {
    registerProgram,
    getAllProgram,
    deleteProgram,
} = require("../controllers/program.controller");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/create",
    upload.none(),
    authMiddleware,
    registerProgram
);

router.post(
    "/get-all",
    upload.none(),
    authMiddleware,
    getAllProgram
);

router.post(
    "/delete",
    upload.none(),
    authMiddleware,
    deleteProgram
);

module.exports = router;