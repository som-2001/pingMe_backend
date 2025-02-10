const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary_config = require("../cloudinary_config.js");

const storage = (folder) =>
  new CloudinaryStorage({
    cloudinary: cloudinary_config,
    params: {
      folder: folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformations: [
        {
          width: 1980,
          height: 1080,
          limit: "crop",
        },
      ],
    },
  });

const upload=(folder)=>multer({storage:storage(folder)})

module.exports = upload;
