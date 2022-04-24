const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    callback(null, Date.now() + "-" + name);
  },
});

// Filtering MIMETYPES
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    req.mimetypeError = true; // to know if an mimetype error was produced.
    cb(null, false);
  }
};

module.exports = multer({ storage, fileFilter: fileFilter}).single("image");
