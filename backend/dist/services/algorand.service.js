"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = exports.checkTransactionStatus = exports.sendTransaction = void 0;
const algosdk_1 = __importDefault(require("algosdk"));
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
// Initialize Algod client
const getAlgodClient = () => {
    const server = process.env.ALGOD_SERVER || "https://testnet-api.algonode.cloud";
    const port = process.env.ALGOD_PORT || "443";
    const token = process.env.ALGOD_TOKEN || "";
    return new algosdk_1.default.Algodv2(token, server, port);
};
/**
 * Send ALGO transaction on Algorand TestNet
 */
const sendTransaction = async (params) => {
    try {
        const { fromMnemonic, toAddress, amount, note } = params;
        // Validate recipient address
        if (!algosdk_1.default.isValidAddress(toAddress)) {
            throw new Error("Invalid recipient address");
        }
        // Recover account from mnemonic
        const account = algosdk_1.default.mnemonicToSecretKey(fromMnemonic);
        // Initialize Algod client
        const algodClient = getAlgodClient();
        // Get suggested transaction parameters
        const suggestedParams = await algodClient.getTransactionParams().do();
        // FIXED: Use correct parameter names for the method
        const transaction = algosdk_1.default.makePaymentTxnWithSuggestedParamsFromObject({
            sender: account.addr, // FIXED: Changed from 'from' to 'sender'
            receiver: toAddress, // FIXED: Changed from 'to' to 'receiver'
            amount: amount,
            note: note ? new Uint8Array(Buffer.from(note)) : undefined,
            suggestedParams
        });
        // Sign transaction
        const signedTxn = transaction.signTxn(account.sk);
        const txId = transaction.txID();
        // Submit transaction
        await algodClient.sendRawTransaction(signedTxn).do();
        // Wait for confirmation (with timeout)
        let confirmedRound;
        let status = "pending";
        try {
            // Use type assertion for confirmation response
            const confirmation = (await algosdk_1.default.waitForConfirmation(algodClient, txId, 4));
            confirmedRound = confirmation["confirmed-round"];
            status = "confirmed";
        }
        catch (waitError) {
            console.warn("Transaction submitted but confirmation timeout:", waitError);
            status = "pending";
        }
        // Save to database
        const transactionDoc = new Transaction_model_1.default({
            txId,
            from: account.addr,
            to: toAddress,
            amount: amount / 1000000, // Convert microAlgos to ALGO
            status,
            note: note || "",
            confirmedRound: confirmedRound || undefined
        });
        await transactionDoc.save();
        return {
            txId,
            confirmedRound,
            status
        };
    }
    catch (error) {
        console.error("Error sending transaction:", error);
        throw new Error(error.message || "Failed to send transaction");
    }
};
exports.sendTransaction = sendTransaction;
/**
 * Check transaction status
 */
const checkTransactionStatus = async (txId) => {
    try {
        // Validate transaction ID format
        if (txId.length !== 52) {
            throw new Error("Invalid transaction ID format");
        }
        const algodClient = getAlgodClient();
        // Check transaction from blockchain
        let confirmedRound;
        let status = "pending";
        try {
            // Use type assertion for transaction info
            const txInfo = (await algodClient
                .pendingTransactionInformation(txId)
                .do());
            if (txInfo["confirmed-round"]) {
                confirmedRound = txInfo["confirmed-round"];
                status = "confirmed";
            }
            else {
                status = "pending";
            }
        }
        catch (error) {
            // Transaction might not exist or failed
            if (error.status === 404 || error.message?.includes("not found")) {
                status = "failed";
            }
            else {
                throw error;
            }
        }
        // Update database
        const transactionDoc = await Transaction_model_1.default.findOneAndUpdate({ txId }, {
            status,
            confirmedRound: confirmedRound || undefined
        }, { new: true });
        if (!transactionDoc) {
            // Transaction not in database, create it
            try {
                const txInfo = (await algodClient
                    .pendingTransactionInformation(txId)
                    .do()
                    .catch(() => null));
                if (txInfo && txInfo.txn && txInfo.txn.txn) {
                    const txn = txInfo.txn.txn;
                    const newTransaction = new Transaction_model_1.default({
                        txId,
                        from: txn.snd ? algosdk_1.default.encodeAddress(txn.snd) : "unknown",
                        to: txn.rcv ? algosdk_1.default.encodeAddress(txn.rcv) : "unknown",
                        amount: txn.amt ? txn.amt / 1000000 : 0,
                        status,
                        confirmedRound: confirmedRound || undefined
                    });
                    await newTransaction.save();
                }
            }
            catch (dbError) {
                console.error("Error creating transaction record:", dbError);
            }
        }
        return {
            txId,
            confirmedRound,
            status
        };
    }
    catch (error) {
        console.error("Error checking transaction status:", error);
        throw new Error(error.message || "Failed to check transaction status");
    }
};
exports.checkTransactionStatus = checkTransactionStatus;
/**
 * Get all transactions from database
 */
const getAllTransactions = async () => {
    try {
        const transactions = await Transaction_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(100);
        return transactions;
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to fetch transactions");
    }
};
exports.getAllTransactions = getAllTransactions;
