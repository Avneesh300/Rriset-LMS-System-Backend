const mongoose = require("mongoose");

const sectionSchema =
  new mongoose.Schema(
    {
      sectionName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
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
  "Section",
  sectionSchema
);