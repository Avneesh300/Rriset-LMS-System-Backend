const mongoose = require("mongoose");
const AssessmentType = require("./UploadPaper.js");

const uploadPaperSchema =
  new mongoose.Schema(
    {
      
      assessment_type_id: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "AssessmentType",
        required: true,
      },

      
      paper_title: {
        type: String,
        required: true,
        trim: true,
      },

     
      file: {
        type: String,
        required: true,
      },

     
      uploaded_by: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
  "UploadPaper",
  uploadPaperSchema
);