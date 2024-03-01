const express = require("express");
const { authMiddlewareAdmin } = require("../middlewares/authMiddleware");
const {
  getAllUserController, // admin
  detailUserByAdminController, // admin
  deleteUserController, // admin
  getAllPhotoController, // admin
  detailPhotoByAdminController, // admin
  deletePhotoController, // admin
  deleteComentarByAdminController,
} = require("../controllers/admin.controllers");

const adminRoutes = express.Router();

// Admin manage user
adminRoutes.get("/users", authMiddlewareAdmin, getAllUserController);
adminRoutes.get("/users/:userId", authMiddlewareAdmin, detailUserByAdminController);
adminRoutes.delete("/users/:userId/", authMiddlewareAdmin, deleteUserController);
// Admin manage photo
adminRoutes.get("/photos", authMiddlewareAdmin, getAllPhotoController);
adminRoutes.get("/photos/:photoId", authMiddlewareAdmin, detailPhotoByAdminController);
adminRoutes.delete("/photos/:photoId", authMiddlewareAdmin, deletePhotoController);

adminRoutes.delete("/:comentarId/comentars", authMiddlewareAdmin, deleteComentarByAdminController);

module.exports = { adminRoutes };
