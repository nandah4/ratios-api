const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { createWithdrawal } = require("../controllers/withdrawals.controller");
const { getWallet } = require("../controllers/wallet.controllers");

const walletRoutes = express.Router();

walletRoutes.get("/", authMiddleware, getWallet);

module.exports = { walletRoutes };
