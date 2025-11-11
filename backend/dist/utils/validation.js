"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.txIdSchema = exports.sendTransactionSchema = void 0;
const zod_1 = require("zod");
const algosdk_1 = __importDefault(require("algosdk"));
exports.sendTransactionSchema = zod_1.z.object({
    fromMnemonic: zod_1.z
        .string()
        .min(1, "Mnemonic is required")
        .refine((mnemonic) => {
        try {
            algosdk_1.default.mnemonicToSecretKey(mnemonic);
            return true;
        }
        catch {
            return false;
        }
    }, { message: "Invalid mnemonic format" }),
    toAddress: zod_1.z
        .string()
        .min(1, "Recipient address is required")
        .refine((address) => algosdk_1.default.isValidAddress(address), {
        message: "Invalid Algorand address format"
    }),
    amount: zod_1.z
        .number()
        .positive("Amount must be positive")
        .min(0.001, "Minimum amount is 0.001 ALGO"),
    note: zod_1.z.string().optional()
});
exports.txIdSchema = zod_1.z.object({
    txId: zod_1.z.string().length(52, "Transaction ID must be 52 characters")
});
