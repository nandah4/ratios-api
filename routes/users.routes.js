const express = require("express");
const { Auth, loginController, registerController } = require("../controllers/users.controllers");

const usersRoutes = express.Router();

usersRoutes.post("/auth/login", loginController);
usersRoutes.post("/auth/register", registerController);

module.exports = { usersRoutes };
