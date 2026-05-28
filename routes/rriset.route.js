const express = require("express");
const router = express.Router();
const {
    registerRriset,
    getOverviewData,
    getRrisetList,
    getRrisetSchoolList,
} = require("../controllers/rriset.controller");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/create",
    upload.none(),
    authMiddleware,
    registerRriset
);

router.post(
    "/getoverviewdata",
    upload.none(),
    authMiddleware,
    getOverviewData
);

router.post(
    "/getrrisetlist",
    upload.none(),
    authMiddleware,
    getRrisetList
);
router.post(
    "/getrrisetschool-list",
    upload.none(),
    authMiddleware,
    getRrisetSchoolList
);

module.exports = router;