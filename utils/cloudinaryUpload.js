const cloudinary = require("../config/cloudinary");

const fs = require("fs");

const cloudinaryUpload = async (
  localFilePath
) => {
  try {
    const result =
      await cloudinary.uploader.upload(
        localFilePath,
        {
          folder: "myapp",
           resource_type: "raw",
        }
      );
    fs.unlinkSync(localFilePath);

    return result;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    throw error;
  }
};

module.exports = cloudinaryUpload;