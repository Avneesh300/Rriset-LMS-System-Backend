const mongoose = require("mongoose");
const Subject = require("./Subject.js");
const SchoolAdmin = require("./School.js");
const User = require('./User.js')

const teacherSchema =
  new mongoose.Schema(
    {

      school_id: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "SchoolAdmin",
        required: true,
      },


      first_name: {
        type: String,
        required: true,
        trim: true,
      },

      last_name: {
        type: String,
        required: true,
        trim: true,
      },


      primary_subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },

      experience_years: {
        type: Number,
        required: true,
        default: 0,
      },


      qualification: {
        type: String,
        required: true,
        trim: true,
      },

      status: {
        type: Boolean,
        default: true,
      },
      created_by: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Teacher",
  teacherSchema
);