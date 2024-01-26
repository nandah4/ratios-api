const express = require("express");
const multer = require('multer')
const photosRoutes = express.Router();
const { getPhoto, getPhotoById, getPhotoByIdUser, createPhoto, updatePhotoById, deletePhotoById } = require('../controllers/photos.controllers');
const { fileStorage, fileFilter } = require('../middlewares/photoMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');

photosRoutes.get("/", authMiddleware, getPhoto); // all photo
photosRoutes.get("/:photoId", authMiddleware, getPhotoById); // by id photo
photosRoutes.get("/:userId/user", authMiddleware, getPhotoByIdUser); // by id user
photosRoutes.post("/", authMiddleware, multer({ storage: fileStorage, fileFilter }).single('locationFile'), createPhoto);
photosRoutes.delete("/:photoId", authMiddleware, deletePhotoById);
photosRoutes.put("/:photoId", authMiddleware, updatePhotoById);

module.exports = { photosRoutes };
