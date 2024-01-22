const express = require("express");

const fileRoutes = express.Router();
const path = require("path");
fileRoutes.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;

  res.sendFile(filename, {
    root: path.join(__dirname + "/../uploads/profiles"),
  });
});

module.exports = { fileRoutes };
