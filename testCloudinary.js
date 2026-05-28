const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dcrn4mdai",
  api_key: "989821539653258",
  api_secret: "r0cPkLqP-2eEyhuuCIqwqngmZWs",
});

cloudinary.api.ping((error, result) => {
  if (error) {
    console.log("❌ FAILED:", error.message);
  } else {
    console.log("✅ SUCCESS:", result);
  }
});