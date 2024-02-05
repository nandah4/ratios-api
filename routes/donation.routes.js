const express = require("express");
const { createDonation } = require("../controllers/donation.controllers");

const donationRoutes = express.Router();

donationRoutes.post("/photo", createDonation);

module.exports = { donationRoutes };
