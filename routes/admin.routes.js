const express = require("express");
const { authMiddlewareAdmin } = require("../middlewares/authMiddleware");
const {
  getAllUserController, // admin
  detailUserByAdminController, // admin
  deleteUserController, // admin
  updateIsdeletedUser,
  getAllPhotoController, // admin
  detailPhotoByAdminController, // admin
  deletePhotoController, // admin
  deleteComentarByAdminController,
  updatePhotoIsDeleted,
} = require("../controllers/admin.controllers");
const { donationRoutes } = require("./donation.routes");
const { getDonation } = require("../controllers/donation.controllers");

const adminRoutes = express.Router();

// Admin manage user
adminRoutes.get("/users", authMiddlewareAdmin, getAllUserController);
adminRoutes.get("/users/:userId", authMiddlewareAdmin, detailUserByAdminController);
adminRoutes.delete("/users/:userId/", authMiddlewareAdmin, deleteUserController);
adminRoutes.put("/users/:userId", authMiddlewareAdmin, updateIsdeletedUser);

// Admin manage photo
adminRoutes.get("/photos", authMiddlewareAdmin, getAllPhotoController);
adminRoutes.get("/photos/:photoId", authMiddlewareAdmin, detailPhotoByAdminController);
adminRoutes.delete("/photos/:photoId", authMiddlewareAdmin, deletePhotoController);
adminRoutes.put("/photos/:photoId", authMiddlewareAdmin, updatePhotoIsDeleted);

adminRoutes.delete("/:comentarId/comentars", authMiddlewareAdmin, deleteComentarByAdminController);

// admin donation
adminRoutes.get("/donation", authMiddlewareAdmin, getDonation);

module.exports = { adminRoutes };
