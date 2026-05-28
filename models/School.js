const mongoose = require("mongoose");
const User = require("./User.js");
const Grade = require("./Grade.js");
const Section = require("./Section.js");
const Institution = require("./Institution.js");

const schoolAdminSchema =
  new mongoose.Schema(
    {

      institution_id: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },


      school_type: {
        type: String,
        required: true,
        trim: true,
      },


      school_name: {
        type: String,
        required: true,
        trim: true,
      },


      school_udise_code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },


      area_type: {
        type: String,
        required: true,
      },


      state: {
        type: String,
        required: true,
      },

      district: {
        type: String,
        required: true,
      },

      town_name: {
        type: String,
        required: true,
      },

      principal_name: {
        type: String,
        required: true,
      },


      category_name: {
        type: String,
        required: true,
      },


      grades_id: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grade",
          required: true,
        },
      ],

      sections_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true,
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
  "SchoolAdmin",
  schoolAdminSchema
);