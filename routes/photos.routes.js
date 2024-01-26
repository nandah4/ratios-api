const express = require("express");
const multer = require('multer')
const photosRoutes = express.Router();
const { getPhoto, getPhotoById, getPhotoByIdUser, createPhoto, updatePhotoById, deletePhotoById } = require('../controllers/photos.controllers');
const { fileStorage, fileFilter } = require('../middlewares/photoMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { createComentarById, deleteComentarById } = require("../controllers/comentar.controllers")
const { createLikeByIdUser, deleteLikeByIdUser } = require("../controllers/like.controllers");

// ROUTES PHOTO
photosRoutes.get("/", authMiddleware, getPhoto); // all photo
photosRoutes.get("/:photoId", authMiddleware, getPhotoById); // by id photo
photosRoutes.post("/user", authMiddleware, getPhotoByIdUser); // by id user
photosRoutes.post("/", authMiddleware, multer({ storage: fileStorage, fileFilter }).single('locationFile'), createPhoto);
photosRoutes.delete("/:photoId", authMiddleware, deletePhotoById);
photosRoutes.put("/:photoId", authMiddleware, updatePhotoById);

// ROUTES COMMENT
photosRoutes.post("/:photoId/comentar", authMiddleware, createComentarById);
photosRoutes.delete(":/comentarId/comentar", authMiddleware, deleteComentarById);

// ROUTES LIKE
photosRoutes.post("/:photoId/like", authMiddleware, createLikeByIdUser);
photosRoutes.delete("/:photoId/like", authMiddleware, deleteLikeByIdUser);

module.exports = { photosRoutes };
