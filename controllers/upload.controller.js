const path = require("path");

const cloudinary =
  require("../config/cloudinary");

const asyncHandler = require("../middleware/asyncHandler");

const responseSuccess = require("../helpers/responseSuccess");

const responseError = require("../helpers/responseError");


// ======================================
// Generate Signed Upload Config
// ======================================
exports.generateSignedUpload =
  asyncHandler(async (req, res) => {

    try {

      const {
        file_name,
      } = req.body;

      // ==========================
      // Validation
      // ==========================
      if (!file_name) {

        return responseError(
          res,
          "file_name is required",
          400
        );
      }

      // ==========================
      // Generate Timestamp
      // ==========================
      const timestamp =
        Math.round(
          Date.now() / 1000
        );

      // ==========================
      // File Extension
      // ==========================
      const ext =
        path.extname(
          file_name
        );

      // ==========================
      // Generate Unique File Name
      // ==========================
      const uniqueFileName =
        `institution_${timestamp}`;

      // ==========================
      // Folder
      // ==========================
      const folder =
        "institution";

      // ==========================
      // Public ID
      // ==========================
      const public_id =
        `${folder}/${uniqueFileName}`;

      // ==========================
      // File Path
      // ==========================
      const file_path =
        `${public_id}${ext}`;

      // ==========================
      // Generate Signature
      // ==========================
      const signature =
        cloudinary.utils.api_sign_request(
          {
            timestamp,
            public_id,
          },

          process.env
            .CLOUDINARY_API_SECRET
        );

      // ==========================
      // Upload URL
      // ==========================
      const upload_url =
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`;

      // ==========================
      // Response
      // ==========================
      return responseSuccess(
        res,
        "Signed upload generated successfully",
        {

          upload_url,

          file_path,

          public_id,

          signature,

          timestamp,

          api_key:
            process.env
              .CLOUDINARY_API_KEY,
        },
        200
      );

    } catch (error) {

      return responseError(
        res,
        error.message,
        500
      );
    }
  });