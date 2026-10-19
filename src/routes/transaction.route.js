const express = require("express");
const { transferController, createIntialFundsTransaction } = require("../controllers/transaction.controller");
const { authMiddleware, authSystemUserMiddleware } = require("../middleware/auth.middleware");


const transactionRouter = express.Router();

transactionRouter.post("/", authMiddleware, transferController);
transactionRouter.post("/system/intial-funds", authSystemUserMiddleware, createIntialFundsTransaction);


module.exports = transactionRouter;