const express = require("express");
const { authMiddlewareAdmin } = require("../middlewares/authMiddleware");
const {
  getAllUserController, // admin
  deleteUserController, // admin
  getAllPhotoController, // admin
  deletePhotoController, // admin
} = require("../controllers/admin.controllers");

const adminRoutes = express.Router();

// Admin manage user 
adminRoutes.get("/users", authMiddlewareAdmin, getAllUserController);
adminRoutes.delete("/:userId/users", authMiddlewareAdmin, deleteUserController);
// Admin manage photo
adminRoutes.get("/photos", authMiddlewareAdmin, getAllPhotoController);
adminRoutes.delete("/:photoId/photos", authMiddlewareAdmin, deletePhotoController);

module.exports = { adminRoutes };
