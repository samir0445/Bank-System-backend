
const ACCOUNT = require("../model/account.model");


async function createAccountController(req, res) {
    const user = req.user;

    // console.log(user);

    const account = await ACCOUNT.create({
        user: user._id
    });

    res.status(201).json({
        account
    });
}

module.exports = { createAccountController };