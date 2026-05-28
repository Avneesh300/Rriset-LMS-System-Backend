const User = require("../models/User");
const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const asyncHandler = require("../middleware/asyncHandler");

const responseSuccess = require("../helpers/responseSuccess");

const responseError = require("../helpers/responseError");


// ======================================
// LOGIN API
// ======================================
exports.login = asyncHandler(
  async (req, res) => {

    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {

      return responseError(
        res,
        "login id and password are required",
        400
      );
    }

    const user =
      await User.findOne({
        $or: [
          { email: email },
          { mobile: email }
        ]
      });


    if (!user) {

      return responseError(
        res,
        "Invalid email or password",
        401
      );
    }

    const isPasswordMatched =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordMatched) {

      return responseError(
        res,
        "Invalid login id or password",
        401
      );
    }

    // ==========================
    // Generate Access Token
    // ==========================
    const accessToken =
      jwt.sign(
        {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            policymaker_id:
              user.policymaker_id,

            schooladmin_id:
              user.schooladmin_id,

            teacher_id:
              user.teacher_id,

            student_id:
              user.student_id,

            institution_id:
              user.institution_id,

            status:
              user.status
          }
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1d",
        }
      );

    // ==========================
    // Generate Refresh Token
    // ==========================
    const refreshToken =
      jwt.sign(
        {
          id: user._id,
        },

        process.env.JWT_REFRESH_SECRET,

        {
          expiresIn: "7d",
        }
      );

    user.refreshToken =
      refreshToken;
    user.accessToken =
      accessToken;

    await user.save();

    // ==========================
    // Response
    // ==========================
    return responseSuccess(
      res,
      "Login successful",
      {
        accessToken,
        refreshToken,

        user: {
          id: user._id,
          username:
            user.username,

          email: user.email,

          mobile:
            user.mobile,

          role: user.role,
        },
      },
      200
    );
  }
);

exports.logout = asyncHandler(
  async (req, res) => {

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {

      return responseError(
        res,
        "User not found",
        404
      );
    }

    user.refreshToken = null;
    user.accessToken = null;

    await user.save();

    return responseSuccess(
      res,
      "Logout successful",
      null,
      200
    );
  }
);

exports.getAllUser =
  asyncHandler(async (req, res) => {
    if (req.user.role !== 1) {

      return responseError(
        res,
        "Access denied. Only Super admin can access",
        403
      );
    }

    const page =
      parseInt(req.body.page) || 1;

    const limit =
      parseInt(req.body.limit) || 10;

    const role =
      req.body.role || "";

    const skip =
      (page - 1) * limit;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    const total =
      await User.countDocuments(
        filter
      );


    const users =
      await User.find(filter)
        .select(
          "-password -refreshToken -accessToken"
        )
        .populate({
          path: "institution_id",

          select:
            "institution_name",
        })

        .sort({
          createdAt: -1,
        })

        .skip(skip)

        .limit(limit);


    const formattedUsers =
      users.map((item) => {

        return {

          id: item._id,

          username:
            item.username,

          email:
            item.email,

          mobile:
            item.mobile,

          role:
            item.role,

          status:
            item.status,

          institution_name:
            item.institution_id
              ?.institution_name ||
            null,
          institution_id: item.institution_id,
        };
      });

    const pagination = {

      total,

      currentPage: page,

      totalPages: Math.ceil(
        total / limit
      ),

      perPage: limit,
    };

    return responseSuccess(
      res,
      "User list fetched successfully",
      {
        users: formattedUsers,
        pagination,
      },
      200
    );
  });


exports.refreshToken =
  asyncHandler(async (req, res) => {

    const {
      refreshToken,
    } = req.body;

    if (!refreshToken) {

      return responseError(
        res,
        "Refresh token is required",
        400
      );
    }

    try {

      const decoded =
        jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

      const user =
        await User.findById(
          decoded.id
        );

      if (!user) {

        return responseError(
          res,
          "User not found",
          404
        );
      }

      if (
        user.refreshToken !==
        refreshToken
      ) {

        return responseError(
          res,
          "Invalid refresh token",
          401
        );
      }

      const newAccessToken =
        jwt.sign(
          {
            id: user._id,

            email:
              user.email,

            role:
              user.role,
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "1d",
          }
        );

      const newRefreshToken =
        jwt.sign(
          {
            id: user._id,
          },

          process.env.JWT_REFRESH_SECRET,

          {
            expiresIn: "7d",
          }
        );

      user.accessToken =
        newAccessToken;

      user.refreshToken =
        newRefreshToken;

      await user.save();

      return responseSuccess(
        res,
        "Token refreshed successfully",
        {
          accessToken:
            newAccessToken,

          refreshToken:
            newRefreshToken,

          user: {
            id: user._id,

            username:
              user.username,

            email:
              user.email,

            mobile:
              user.mobile,

            role:
              user.role,
          },
        },
        200
      );

    } catch (error) {

      return responseError(
        res,
        "Invalid or expired refresh token",
        401
      );
    }
  });


  exports.changePassword = asyncHandler(
  async (req, res) => {

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return responseError(
        res,
        "All fields are required",
        400
      );
    }

    if (newPassword !== confirmPassword) {
      return responseError(
        res,
        "New password and confirm password do not match",
        400
      );
    }

    const user = await User.findById(
      req.user.user.id
    );

    if (!user) {
      return responseError(
        res,
        "User not found",
        404
      );
    }

    const isPasswordMatched =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isPasswordMatched) {
      return responseError(
        res,
        "Current password is incorrect",
        401
      );
    }

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        salt
      );

    user.password =
      hashedPassword;
    user.accessToken = null;
    user.refreshToken = null;
    await user.save();
    return responseSuccess(
      res,
      "Password changed successfully",
      null,
      200
    );
  }
);

exports.forgotPasswordByEmail =
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return responseError(
        res,
        "Email is required",
        400
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return responseError(
        res,
        "User not found",
        404
      );
    }

    // ==========================
    // Generate Random Token
    // ==========================
    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    // ==========================
    // Hash Token
    // ==========================
    const hashedToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // ==========================
    // Save Hashed Token
    // ==========================
    user.resetPasswordToken =
      hashedToken;

    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // ==========================
    // Reset Link
    // ==========================
    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // ==========================
    // Email HTML
    // ==========================
    const html = `
      <div style="
        max-width:600px;
        margin:auto;
        font-family:Arial;
        background:#f5f5f5;
        padding:40px;
      ">

        <h2>
          Reset Password
        </h2>

        <p>
          Click below button to reset your password.
        </p>

        <a
          href="${resetLink}"

          style="
            background:green;
            color:white;
            padding:12px 25px;
            text-decoration:none;
            border-radius:5px;
            display:inline-block;
            margin-top:20px;
          "
        >
          Reset Password
        </a>

        <p style="
          margin-top:25px;
          color:red;
        ">
          This link will expire in
          15 minutes.
        </p>

      </div>
    `;

    // ==========================
    // Send Email
    // ==========================
    await sendEmail(
      user.email,
      "Reset Password",
      html
    );

    return responseSuccess(
      res,
      "Password reset link sent to email",
      null,
      200
    );
  });

 exports.resetPasswordByEmail =
  asyncHandler(async (req, res) => {
    const {
      token,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !token ||
      !newPassword ||
      !confirmPassword
    ) {
      return responseError(
        res,
        "All fields are required",
        400
      );
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      return responseError(
        res,
        "Passwords do not match",
        400
      );
    }

    if (
      newPassword.length < 8
    ) {

      return responseError(
        res,
        "Password must be at least 8 characters",
        400
      );
    }

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // ==========================
    // Find User
    // ==========================
    const user =
      await User.findOne({

        resetPasswordToken:
          hashedToken,

        resetPasswordExpires: {
          $gt: Date.now(),
        },
      });

    if (!user) {

      return responseError(
        res,
        "Invalid or expired token",
        400
      );
    }

    // ==========================
    // Hash New Password
    // ==========================
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // ==========================
    // Update Password
    // ==========================
    user.password =
      hashedPassword;

    // ==========================
    // Remove Reset Fields
    // ==========================
    user.resetPasswordToken =
      null;

    user.resetPasswordExpires =
      null;

    // ==========================
    // Logout From All Devices
    // ==========================
    user.accessToken = null;

    user.refreshToken = null;

    await user.save();

    return responseSuccess(
      res,
      "Password reset successful",
      null,
      200
    );
  });

exports.forgotPasswordByOtp =
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    // ==========================
    // Validation
    // ==========================
    if (!email) {

      return responseError(
        res,
        "Email is required",
        400
      );
    }

    // ==========================
    // Find User
    // ==========================
    const user =
      await User.findOne({ email });

    if (!user) {

      return responseError(
        res,
        "User not found",
        404
      );
    }

    // ==========================
    // Generate OTP
    // ==========================
    const otp =
      crypto.randomInt(
        100000,
        999999
      ).toString();

    // ==========================
    // Hash OTP
    // ==========================
    const hashedOtp =
      await bcrypt.hash(
        otp,
        10
      );

    // ==========================
    // Save OTP
    // ==========================
    user.resetPasswordOtp =
      hashedOtp;

    user.resetPasswordOtpExpires =
      Date.now() +
      10 * 60 * 1000;

    user.resetPasswordVerified =
      false;

    await user.save();

    // ==========================
    // Email Template
    // ==========================
    const html = `
      <div style="
        max-width:600px;
        margin:auto;
        font-family:Arial;
        background:#f5f5f5;
        padding:40px;
      ">

        <div style="
          text-align:center;
        ">
          <h2>
            Password Reset OTP
          </h2>
        </div>

        <p>
          Hello ${user.username || "User"},
        </p>

        <p>
          Use the OTP below to reset
          your password.
        </p>

        <div style="
          font-size:35px;
          font-weight:bold;
          letter-spacing:10px;
          color:green;
          margin:30px 0;
          text-align:center;
        ">
          ${otp}
        </div>

        <p>
          This OTP will expire in
          <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this,
          please ignore this email.
        </p>

        <br/>

        <p>
          Regards,
          <br/>
          <strong>Team</strong>
        </p>

      </div>
    `;

    // ==========================
    // Send Email
    // ==========================
    await sendEmail(
      user.email,
      "Password Reset OTP",
      html
    );

    return responseSuccess(
      res,
      "OTP sent successfully to email",
      null,
      200
    );
  });

  exports.verifyResetOtp =
  asyncHandler(async (req, res) => {

    const {
      email,
      otp,
    } = req.body;

    // ==========================
    // Validation
    // ==========================
    if (!email || !otp) {

      return responseError(
        res,
        "Email and OTP are required",
        400
      );
    }

    // ==========================
    // Find User
    // ==========================
    const user =
      await User.findOne({ email });

    if (!user) {

      return responseError(
        res,
        "User not found",
        404
      );
    }

    // ==========================
    // Check OTP Exists
    // ==========================
    if (
      !user.resetPasswordOtp
    ) {

      return responseError(
        res,
        "OTP not found",
        400
      );
    }

    // ==========================
    // Check Expiry
    // ==========================
    if (
      user.resetPasswordOtpExpires <
      Date.now()
    ) {

      return responseError(
        res,
        "OTP expired",
        400
      );
    }

    // ==========================
    // Compare OTP
    // ==========================
    const isOtpMatched =
      await bcrypt.compare(
        otp,
        user.resetPasswordOtp
      );

    if (!isOtpMatched) {

      return responseError(
        res,
        "Invalid OTP",
        400
      );
    }

    // ==========================
    // Mark Verified
    // ==========================
    user.resetPasswordVerified =
      true;

    await user.save();

    return responseSuccess(
      res,
      "OTP verified successfully",
      null,
      200
    );
  });

  exports.resetPasswordByOtp =
  asyncHandler(async (req, res) => {

    const {
      email,
      newPassword,
      confirmPassword,
    } = req.body;

    // ==========================
    // Validation
    // ==========================
    if (
      !email ||
      !newPassword ||
      !confirmPassword
    ) {

      return responseError(
        res,
        "All fields are required",
        400
      );
    }

    // ==========================
    // Password Match
    // ==========================
    if (
      newPassword !==
      confirmPassword
    ) {

      return responseError(
        res,
        "Passwords do not match",
        400
      );
    }

    // ==========================
    // Password Length
    // ==========================
    if (
      newPassword.length < 8
    ) {

      return responseError(
        res,
        "Password must be at least 8 characters",
        400
      );
    }

    // ==========================
    // Find User
    // ==========================
    const user =
      await User.findOne({ email });

    if (!user) {

      return responseError(
        res,
        "User not found",
        404
      );
    }

    // ==========================
    // Check OTP Verification
    // ==========================
    if (
      !user.resetPasswordVerified
    ) {

      return responseError(
        res,
        "OTP verification required",
        400
      );
    }

    // ==========================
    // Hash Password
    // ==========================
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // ==========================
    // Update Password
    // ==========================
    user.password =
      hashedPassword;

    // ==========================
    // Clear Reset Fields
    // ==========================
    user.resetPasswordOtp =
      null;

    user.resetPasswordOtpExpires =
      null;

    user.resetPasswordVerified =
      false;

    // ==========================
    // Logout All Devices
    // ==========================
    user.accessToken = null;

    user.refreshToken = null;

    await user.save();

    return responseSuccess(
      res,
      "Password reset successful",
      null,
      200
    );
  });
