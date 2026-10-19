const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ACCOUNT",
        required: [true, "Account is required"],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        index: true,
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TRANSACTION",
        required: [true, "Transaction is required"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["DEBIT", "CREDIT"],
            message: "Type must be DEBIT or CREDIT"
        },
        required: [true, "Type is required"],
        immutable: true
    }
}, {
    timestamps: true
})

function preventLedgerMOdification() {
    throw new Error("Ledger can not be modified");
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerMOdification);
ledgerSchema.pre("findOneAndDelete", preventLedgerMOdification);
ledgerSchema.pre("updateOne", preventLedgerMOdification);
ledgerSchema.pre("updateMany", preventLedgerMOdification);
ledgerSchema.pre("deleteOne", preventLedgerMOdification);
ledgerSchema.pre("deleteMany", preventLedgerMOdification);
ledgerSchema.pre("remove", preventLedgerMOdification);


const LEDGER = mongoose.model("LEDGER", ledgerSchema);

module.exports = LEDGER;