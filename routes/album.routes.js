const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getAlbumsByUserIdController,
  createAlbumByUserIdController,
  getAlbumByAlbumIdAndUserIdController,
  updateAlbumByUserIdController,
  deleteAlbumByAlbumIdAndUserIdController,
  addPhotoToAlbum,
  deletePhotoFromAlbum,
} = require("../controllers/albums.controllers");

const albumRoutes = express.Router();

albumRoutes.get("/:albumId", authMiddleware, getAlbumByAlbumIdAndUserIdController);
albumRoutes.get("/users/:userId", authMiddleware, getAlbumsByUserIdController); 
albumRoutes.post("/", authMiddleware, createAlbumByUserIdController);
albumRoutes.post("/:albumId/photos/:photoId", authMiddleware, addPhotoToAlbum);
albumRoutes.put("/:albumId", authMiddleware, updateAlbumByUserIdController);
albumRoutes.delete("/:albumId", authMiddleware, deleteAlbumByAlbumIdAndUserIdController);
albumRoutes.delete("/:albumId/photos/:photoId", authMiddleware, deletePhotoFromAlbum);

module.exports = { albumRoutes };
