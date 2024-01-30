const express = require("express");
const { dirname } = require("path");

const fileRoutes = express.Router();
const path = require("path");

fileRoutes.get("/images/profiles/:filename", (req, res) => {
  const filename = req.params.filename;

  
  res.sendFile(filename, {
    root: path.join(__dirname + "/../uploads/profiles"),
  });
});



fileRoutes.get("/images/photos/:filename", (req, res) => {
  let filename = req.params.filename;

  // decode nama file mengembalikan spasi/karakter khusus ke format semula
  filename = decodeURIComponent(filename);
  res.sendFile(filename, {
    root: path.join(__dirname + "/../uploads/photos"),
  });
});

module.exports = { fileRoutes };
