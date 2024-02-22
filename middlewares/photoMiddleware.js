const { PrismaClient } = require("@prisma/client");
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/photos/");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/\s+/g, "-");
    const date = new Date().toDateString();
    cb(null, `ratio-images-${date}-${req.body.title}`);
  },
});

const fileStorage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles/");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${fileName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = { fileStorage, fileStorage2, fileFilter };
