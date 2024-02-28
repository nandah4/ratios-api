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
adminRoutes.get("/:userId/users", authMiddlewareAdmin, detailUserByAdminController);
adminRoutes.delete("/:userId/users", authMiddlewareAdmin, deleteUserController);
// Admin manage photo
adminRoutes.get("/photos", authMiddlewareAdmin, getAllPhotoController);
adminRoutes.get("/:photoId/photos", authMiddlewareAdmin, detailPhotoByAdminController);
adminRoutes.delete("/:photoId/photos", authMiddlewareAdmin, deletePhotoController);

adminRoutes.delete("/:comentarId/comentars",authMiddlewareAdmin, deleteComentarByAdminController);

module.exports = { adminRoutes };
