const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const { createAccountController } = require("../controllers/account.controller");


const accRouter = express.Router();


accRouter.post("/", authMiddleware, createAccountController);

module.exports = accRouter;