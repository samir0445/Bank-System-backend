const TRANSACTION = require("../model/transaction.model");
const ACCOUNT = require("../model/account.model");

const mongoose = require("mongoose");

const LEDGER = require("../model/ledger.model");


/*
 -10 steps
 1. Validate req
 2.Validate idempotency
 3.check account status
 4.Derive sender balance from ledger
 5.create pending transaction
 6.debit ledger entry
 7.creditledger entry
 8.Compelete transaction
 9.commit MongoDb sessin
 10.Send email notification



*/
async function transferController(req, res) {

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    if (fromAccount.toString() === toAccount.toString()) {
        return res.status(400).json({
            message: "from and to accounts cannot be same",
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            message: "Amount must be positive",
        });
    }

    const fromacc = await ACCOUNT.findOne({ _id: fromAccount });
    if (!fromacc) {
        return res.status(404).json({
            message: "from account not found",
        });
    }

    const toacc = await ACCOUNT.findOne({ _id: toAccount });
    if (!toacc) {
        return res.status(404).json({
            message: "to account not found",
        });
    }

    const isTransactionExists = await TRANSACTION.findOne({ idempotencyKey: idempotencyKey });

    if (isTransactionExists) {
        if (isTransactionExists.status == "COMPLETED") {
            return res.status(400).json({
                message: "Transaction already processed",
                transaction: isTransactionExists
            });
        } else if (isTransactionExists.status == "PENDING") {
            return res.status(200).json({
                message: "Transaction is in process"
            });
        } else if (isTransactionExists.status == "FAILED") {
            return res.status(400).json({
                message: "Transaction failed , try again"
            });
        } else if (isTransactionExists.status == "REVERSED") {
            return res.status(400).json({
                message: "Transaction reversed"
            });
        }
    }

    if (fromacc.status !== "ACTIVE" || toacc.status !== "ACTIVE") {
        return res.status(400).json({
            message: "from or to account is not active",
        });
    }

    // aggregation pipeline

    const balance = await fromacc.getBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: "Insufficient balance",
        });
    }
    let transaction;
    try {

        const session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await TRANSACTION.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        const debitledger = await LEDGER.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session });

        await (() => {
            return new Promise((resolve) =>
                setTimeout(
                    resolve
                    , 15 * 100)
            );
        })();

        const creditledger = await LEDGER.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session });

        // transaction.status = "COMPLETED"
        // await transaction.save({ session });

        await TRANSACTION.findOneAndUpdate(
            { _id: transaction._id },
            { $set: { status: "COMPLETED" } },
            { session }
        );



        await session.commitTransaction();

        session.endSession();
    } catch (err) {

        return res.status(400).json({
            message: "Transaction is pending due to soem reason please try afters some time"

        });
    }


    // send email notification

    res.status(200).json({
        message: "Transaction completed successfully",
        transaction,
    });
}


async function createIntialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    const toacc = await ACCOUNT.findOne({ _id: toAccount });
    if (!toacc) {
        return res.status(404).json({
            message: "to account not found",
        });
    }
    console.log("toacc found");


    const fromAccount = await ACCOUNT.findOne({ user: req.user._id });
    if (!fromAccount) {
        return res.status(404).json({
            message: "from account not found",
        });
    }

    console.log("from acc found");



    const session = await mongoose.startSession();
    session.startTransaction();

    // const transaction = new TRANSACTION({
    //     fromAccount,
    //     toAccount,
    //     amount,
    //     idempotencyKey,
    //     status: "PENDING"
    // });

    const transaction = (await TRANSACTION.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], { session }))[0];

    const debitledger = await LEDGER.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session });

    const creditledger = await LEDGER.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session });



    await TRANSACTION.findOneAndUpdate(
        { _id: transaction._id },
        { $set: { status: "COMPLETED" } },
        { session }
    );


    await session.commitTransaction();

    session.endSession();

    return res.status(200).json({
        message: " intial fundinng Transaction completed successfully",
        transaction: transaction,
    });



}


module.exports = { transferController, createIntialFundsTransaction };
