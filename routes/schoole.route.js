const express = require("express");

const router = express.Router();

const {
    registerSchoole,
    getAllSchoole,
    deleteSchoole,
    importSchools,
    getSchoolebyId
} = require("../controllers/schoole.controller.js");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");


router.post(
    "/create",
    upload.none(),
    authMiddleware,
    registerSchoole
);
router.post(
    "/getall",
    upload.none(),
    authMiddleware,
    getAllSchoole
);

router.post(
    "/getbyid",
    upload.none(),
    authMiddleware,
    getSchoolebyId
);


router.post(
    "/update_status",
    upload.none(),
    authMiddleware,
    deleteSchoole
);

router.post(
    "/import-schools",
    authMiddleware,
    upload.single("file"),
    importSchools
);



module.exports = router;