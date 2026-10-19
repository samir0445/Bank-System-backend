const mongoose = require("mongoose");

const accountSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Account must be associated with user"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "INACTIVE"],
            message: "Status must be ACTIVE FROZEN or INACTIVE"
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        enum: {
            values: ["INR", "USD", "EUR"],
            message: "Currency must be INR, USD or EUR"
        },
        required: [true, "Currency is required"],
        default: "INR"
    }

}, {
    timestamps: true
})

/*
balance is never hardcoded in schema generally. It generally implemented using ledger
*/

accountSchema.index({ user: 1, status: 1 });

const ACCOUNT = mongoose.model("ACCOUNT", accountSchema);

module.exports = ACCOUNT;