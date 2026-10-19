const express = require("express");

const { userRegisterController, userLoginController, userLogoutController } = require('../controllers/auth.controller');
const { authMiddleware } = require("../middleware/auth.middleware");


const authRouter = express.Router();

authRouter.post("/register", userRegisterController);

authRouter.post("/login", userLoginController);

authRouter.post("/logout", authMiddleware, userLogoutController);





module.exports = authRouter;