const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const likeRoutes = express.Router();
const { createLikeByIdUser, deleteLikeByIdUser } = require("../controllers/like.controllers");

likeRoutes.post("/:photoId/like", authMiddleware, createLikeByIdUser);
likeRoutes.delete("/:photoId/like", authMiddleware, deleteLikeByIdUser);
    
module.exports = { likeRoutes };

