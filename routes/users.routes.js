const express = require("express");
const { authMiddleware } = require('../middlewares/authMiddleware')
const { loginController, registerController, getUserByIdUser, updateProfileByIdUser } = require("../controllers/users.controllers");
const multer = require('multer');
const {fileStorage2, fileFilter} = require('../middlewares/photoMiddleware');

const usersRoutes = express.Router();

// login dan register controllers
usersRoutes.post("/auth/login", loginController);
usersRoutes.post("/auth/register", registerController);

// profile user
usersRoutes.get("/account", authMiddleware, getUserByIdUser);
usersRoutes.put("/account/profile", authMiddleware, multer({storage: fileStorage2, fileFilter}).single('photoUrl'), updateProfileByIdUser);

module.exports = { usersRoutes };
