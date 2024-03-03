const express = require("express");
const { authMiddleware, authMiddlewareAdmin } = require("../middlewares/authMiddleware");
const {
  loginController,
  loginAdminController,
  registerController,
  getAllUser,
  updateProfileByIdUser,
  getOtherUser,
  getAlbumsByUserIdController,
  getPhotoByIdUser,
} = require("../controllers/users.controllers");
const {
  getFollowersController,
  followUsersController,
  getFollowingController,
  unfollowControllers,
  deleteFollowersController,
} = require("../controllers/follows.controllers");
const multer = require("multer");
const { fileStorage2, fileFilter } = require("../middlewares/photoMiddleware");
const { getPhoto } = require("../controllers/photos.controllers");

const usersRoutes = express.Router();

// login admin
usersRoutes.post("/auth/login/admin", loginAdminController);

// login dan register controllers
usersRoutes.post("/auth/login", loginController);
usersRoutes.post("/auth/register", registerController);

// profile user
usersRoutes.get("/", authMiddleware, getAllUser);
usersRoutes.get("/:identifier", authMiddleware, getOtherUser);
usersRoutes.put(
  "/profile",
  authMiddleware,
  multer({ storage: fileStorage2, fileFilter }).single("photoUrl"),
  updateProfileByIdUser
);

// user album
usersRoutes.get("/:userId/albums", authMiddleware, getAlbumsByUserIdController);

// user photo
usersRoutes.get("/:userId/photos", authMiddleware, getPhotoByIdUser);

// following follower
usersRoutes.get("/:userId/followers", authMiddleware, getFollowersController);
usersRoutes.get("/:userId/following", authMiddleware, getFollowingController);
usersRoutes.post("/:userId/follow", authMiddleware, followUsersController);
usersRoutes.delete("/:userId/unfollow", authMiddleware, unfollowControllers);
usersRoutes.delete("/followers/:followerId", authMiddleware, deleteFollowersController);
// get post other user
// usersRoutes.get("/account/:userId/posts", getPostOtherUser);
module.exports = { usersRoutes };
