
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

async function getUserAccounts(req, res) {

    const user = req.user;
    const accounts = await ACCOUNT.find({ user: user._id });

    res.status(200).json({
        accounts: accounts
    });

}

async function getAccountBalance(req, res) {

    const { accountId } = req.params;
    const account = await ACCOUNT.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
        return res.status(404).json({
            message: "Account not found",
        });
    }
    const balance = await account.getBalance();

    res.status(200).json({
        account: account,
        balance: balance
    });

}

module.exports = { createAccountController, getUserAccounts, getAccountBalance };