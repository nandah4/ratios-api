const express = require("express");

const photosRoutes = express.Router();

photosRoutes.get("/photos");

module.exports = { photosRoutes };
