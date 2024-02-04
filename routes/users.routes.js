const express = require("express");
const { authMiddleware } = require('../middlewares/authMiddleware')
const { loginController,
    loginAdminController,
    registerController,
    getUserByIdUser,
    updateProfileByIdUser,
    getOtherUser,
} = require("../controllers/users.controllers");
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
usersRoutes.get("/account/:identifier", getOtherUser);
usersRoutes.put("/account/profile", authMiddleware, multer({ storage: fileStorage2, fileFilter }).single('photoUrl'), updateProfileByIdUser);

// get post other user
// usersRoutes.get("/account/:userId/posts", getPostOtherUser);
module.exports = { usersRoutes };
