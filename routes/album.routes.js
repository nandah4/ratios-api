const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getAlbumsByUserIdController,
  createAlbumByUserIdController,
  getAlbumByAlbumIdAndUserIdController,
  updateAlbumByUserIdController,
  deleteAlbumByAlbumIdAndUserIdController,
} = require("../controllers/albums.controllers");

const albumRoutes = express.Router();

albumRoutes.get("/", authMiddleware, getAlbumsByUserIdController);
albumRoutes.get("/:albumId", authMiddleware, getAlbumByAlbumIdAndUserIdController);
albumRoutes.post("/", authMiddleware, createAlbumByUserIdController);
albumRoutes.put("/:albumId", authMiddleware, updateAlbumByUserIdController);
albumRoutes.delete("/:albumId", authMiddleware, deleteAlbumByAlbumIdAndUserIdController);

module.exports = { albumRoutes };
