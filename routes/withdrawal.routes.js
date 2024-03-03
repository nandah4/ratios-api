const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { createWithdrawal } = require("../controllers/withdrawals.controller");

const withDrawalRoutes = express.Router();

withDrawalRoutes.post("/", authMiddleware, createWithdrawal);

module.exports = { withDrawalRoutes };
