const express = require("express");
const { checkStatus } = require("../controllers/donation.controllers");

const donationRoutes = express.Router();

donationRoutes.get("/:orderId/status", checkStatus);

module.exports = { donationRoutes };
