const express = require("express");
const multer = require("multer");
const photosRoutes = express.Router();
const { getPhoto, getPhotoById, getPhotoByIdUser, createPhoto, updatePhotoById, deletePhotoById } = require("../controllers/photos.controllers");
const { fileStorage, fileFilter } = require("../middlewares/photoMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { createComentarById, updateComentarByUserId, deleteComentarById, getComentarByPhotoId } = require("../controllers/comentar.controllers");
const { createLikeByIdUser } = require("../controllers/like.controllers");
const { createDonation } = require("../controllers/donation.controllers");

// ROUTES PHOTO
photosRoutes.get("/users/:userId", authMiddleware, getPhotoByIdUser); // by id user
photosRoutes.get("/:photoId", authMiddleware, getPhotoById); // by id photo
photosRoutes.get("/", authMiddleware, getPhoto); // all photo
photosRoutes.post("/", authMiddleware, multer({ storage: fileStorage, fileFilter }).single("locationFile"), createPhoto);
photosRoutes.delete("/:photoId", authMiddleware, deletePhotoById);
photosRoutes.put("/:photoId", authMiddleware, updatePhotoById);
photosRoutes.post("/:photoId/donation", authMiddleware, createDonation);

// ROUTES COMMENT
photosRoutes.get("/:photoId/comentar", authMiddleware, getComentarByPhotoId);
photosRoutes.post("/:photoId/comentar", authMiddleware, createComentarById);
photosRoutes.put("/:comentarId/update", authMiddleware, updateComentarByUserId);
photosRoutes.delete("/:comentarId/comentar", authMiddleware, deleteComentarById);

// ROUTES LIKE
photosRoutes.post("/:photoId/like", authMiddleware, createLikeByIdUser);
// photosRoutes.delete("/:photoId/like", authMiddleware, deleteLikeByIdUser);

module.exports = { photosRoutes };
