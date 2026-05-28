const mongoose = require("mongoose");
const User = require("./User");

const institutionSchema =
  new mongoose.Schema(
    {

      institution_name: {
        type: String,
        required: true,
        trim: true,
      },

      institution_type: {
        type: String,
        required: true,
        trim: true,
      },

      contact_person_name: {
        type: String,
        required: true,
        trim: true,
      },


      country: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },


      city: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      rejected_reason: {
        type: String,
        trim: true,
      },


      // ==========================
      // 1 = Pending
      // 2 = Approved
      // 3 = Rejected
      // ==========================
      institution_status: {
        type: Number,
        enum: [1, 2, 3],
        default: 1,
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
  "Institution",
  institutionSchema
);