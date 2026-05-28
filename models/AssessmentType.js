const mongoose = require("mongoose");

const assessmentTypeSchema =
  new mongoose.Schema(
    {
     
      assessment_type_name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },

      
      description: {
        type: String,
        required: true,
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
  "AssessmentType",
  assessmentTypeSchema
);