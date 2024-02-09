const express = require("express");
const { authMiddleware } = require('../middlewares/authMiddleware')
const { loginController,
    loginAdminController,
    registerController,
    getUserByIdUser,
    updateProfileByIdUser,
    getOtherUser,
} = require("../controllers/users.controllers");
const {
    getFollowersController,
    followUsersController,
    getFollowingController,
    unfollowControllers,
    deleteFollowersController
} = require("../controllers/follows.controllers");
const multer = require('multer');
const { fileStorage2, fileFilter } = require('../middlewares/photoMiddleware');

const usersRoutes = express.Router();

// login admin
usersRoutes.post("/auth/login/admin", loginAdminController);

// login dan register controllers
usersRoutes.post("/auth/login", loginController);
usersRoutes.post("/auth/register", registerController);

// profile user
usersRoutes.get("/account", authMiddleware, getUserByIdUser);
usersRoutes.get("/account/:identifier", authMiddleware, getOtherUser);
usersRoutes.put("/account/profile", authMiddleware, multer({ storage: fileStorage2, fileFilter }).single('photoUrl'), updateProfileByIdUser);

// following follower
usersRoutes.get("/account/:userId/followers", authMiddleware, getFollowersController);
usersRoutes.get("/account/:userId/following", authMiddleware, getFollowingController);
usersRoutes.post("/account/:userId/follow", authMiddleware, followUsersController);
usersRoutes.delete("/account/:userId/unfollow", authMiddleware, unfollowControllers);
usersRoutes.delete("/account/followers/:followerId", authMiddleware, deleteFollowersController);
// get post other user
// usersRoutes.get("/account/:userId/posts", getPostOtherUser);
module.exports = { usersRoutes };
