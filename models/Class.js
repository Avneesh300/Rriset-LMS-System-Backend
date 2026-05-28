const mongoose = require("mongoose");
const Grade = require("./Grade.js");
const User = require("./User.js");
const Section = require("./Section.js")
const SchoolAdmin = require("./School.js")

const classSchema =
  new mongoose.Schema(
    {
      class_name: {
        type: String,
        trim: true,
      },

      section_name: {
        type: String,
        trim: true,
      },

      school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SchoolAdmin",
        required: true,
      },

      grade_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grade",
        required: true,
      },

      section_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true,
      },
      academic_year: {
        type: String,
        required: true,
        trim: true,
      },

      student_capacity: {
        type: Number,
        required: true,
        default: 0,
      },

      created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
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
  "Class",
  classSchema
);