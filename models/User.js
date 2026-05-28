const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {

    username: {
      type: String,
      trim: true,
    },

    email: {
      type: String,

      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,

      default: null,
    },
    accessToken: {
      type: String,
      default: null,
    },
    // Roles
    // 1 = Super Admin
    // 2 = Policy Maker
    // 3 = School Admin
    // 4 = Teacher
    // 5 = Institution

    role: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5],
    },


    policymaker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PolicyMaker",
      default: null,
    },

    schooladmin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolAdmin",
      default: null,
    },

    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    institution_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    resetPasswordVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);