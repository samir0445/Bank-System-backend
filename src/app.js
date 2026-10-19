const express = require("express");

const authRouter = require("./routes/auth.route");
const accRouter = require("./routes/account.route");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/account", accRouter);


module.exports = app;

