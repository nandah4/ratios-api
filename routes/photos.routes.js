const express = require("express");
const multer = require('multer')
const photosRoutes = express.Router();
const { getPhoto, getPhotoById, createPhoto, updatePhotoById, deletePhotoById } = require('../controllers/photos.controllers');
const { fileStorage, fileFilter } = require('../middlewares/photoMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');

photosRoutes.get("/", authMiddleware, getPhoto);
photosRoutes.get("/:photoId", authMiddleware, getPhotoById);
photosRoutes.post("/",authMiddleware, multer({ storage: fileStorage, fileFilter }).single('locationFile'), createPhoto);
photosRoutes.delete("/:photoId",authMiddleware, deletePhotoById);
photosRoutes.put("/:photoId",authMiddleware, updatePhotoById);

module.exports = { photosRoutes };
