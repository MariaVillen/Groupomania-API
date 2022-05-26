const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (file.fieldname === "avatar") { 
      callback(null, 'images/persons');
    } else if (file.fieldname === "cover") { // else uploading image
      callback(null, 'images/covers');
    } else {
      console.log('pasando por images');
    callback(null, "images/posts");
    }
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
    file.mimetype === "image/jpeg"||
    file.mimetype === "image/webp" 
  ) {
    cb(null, true);
  } else {
    req.mimetypeError = true; // to know if an mimetype error was produced.
    cb(null, false);
  }
};

const upload = multer({storage: storage, fileFilter: fileFilter});
module.exports = upload;
