const express = require("express");

const { userRegisterController, userLoginController } = require('../controllers/auth.controller');

const authRouter = express.Router();

authRouter.post("/register", userRegisterController);

authRouter.post("/login", userLoginController);



module.exports = authRouter;