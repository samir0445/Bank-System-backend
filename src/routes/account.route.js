const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { createAccountController, getUserAccounts, getAccountBalance } = require("../controllers/account.controller");


const accRouter = express.Router();


accRouter.post("/", authMiddleware, createAccountController);

accRouter.get("/", authMiddleware, getUserAccounts);

accRouter.get("/balance/:accountId", authMiddleware, getAccountBalance);



module.exports = accRouter;