const mongoose = require("mongoose");

const transactionScehma = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ACCOUNT",
        required: [true, "From Account is required"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ACCOUNT",
        required: [true, "To Account is required"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status must be PENDING COMPLETED or FAILED"
        },
        required: [true, "Status is required"],
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount can not be negative"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required"],
        unique: [true, "Idempotency key already exists"],
        index: true
    }
}, {
    timestamps: true
})

const TRANSACTION = mongoose.model("TRANSACTION", transactionScehma);

module.exports = TRANSACTION;