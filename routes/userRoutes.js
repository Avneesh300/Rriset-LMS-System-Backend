const express = require("express");

const router = express.Router();

const {
  login,
  logout,
  refreshToken,
  getAllUser,
  changePassword,
  forgotPasswordByEmail,
  resetPasswordByEmail,
  forgotPasswordByOtp,
  verifyResetOtp,
  resetPasswordByOtp
} = require("../controllers/userController");

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/login",
  upload.none(),
  login
);

router.post(
  "/logout",
  upload.none(),
  authMiddleware,
  logout
);

router.post(
  "/refresh-token",
  upload.none(),
  refreshToken
);
router.post(
  "/getuserlist",
  upload.none(),
  authMiddleware,
  getAllUser
);

router.post(
  "/changepassword",
  upload.none(),
  authMiddleware,
  changePassword
);

router.post(
  "/forget-password-by-email",
  upload.none(),
  authMiddleware,
  forgotPasswordByEmail
);

router.post(
  "/reset-password-by-email",
  upload.none(),
  authMiddleware,
  resetPasswordByEmail
);

router.post(
  "/forget-password-by-otp",
  upload.none(),
  authMiddleware,
  forgotPasswordByOtp
);

router.post(
  "/veryfyopt",
  upload.none(),
  authMiddleware,
  verifyResetOtp
);

router.post(
  "/reset-password-by-opt",
  upload.none(),
  authMiddleware,
  resetPasswordByOtp
);




module.exports = router;