"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = exports.getTransactionStatus = exports.sendTransaction = void 0;
const algorandService = __importStar(require("../services/algorand.service"));
const validation_1 = require("../utils/validation");
/**
 * POST /api/algorand/send
 * Send ALGO transaction
 */
const sendTransaction = async (req, res) => {
    try {
        // Validate request body
        const validationResult = validation_1.sendTransactionSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: "Validation error",
                details: validationResult.error.issues // FIXED: Changed from .errors to .issues
            });
        }
        const { fromMnemonic, toAddress, amount, note } = validationResult.data;
        // Convert ALGO to microAlgos
        const amountInMicroAlgos = Math.round(amount * 1000000);
        // Send transaction
        const result = await algorandService.sendTransaction({
            fromMnemonic,
            toAddress,
            amount: amountInMicroAlgos,
            note
        });
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error("Send transaction error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to send transaction"
        });
    }
};
exports.sendTransaction = sendTransaction;
/**
 * GET /api/algorand/status/:txId
 * Check transaction status
 */
const getTransactionStatus = async (req, res) => {
    try {
        const { txId } = req.params;
        if (!txId || txId.length !== 52) {
            return res.status(400).json({
                success: false,
                error: "Invalid transaction ID format"
            });
        }
        const result = await algorandService.checkTransactionStatus(txId);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error("Get transaction status error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to check transaction status"
        });
    }
};
exports.getTransactionStatus = getTransactionStatus;
/**
 * GET /api/algorand/transactions
 * Get all transactions
 */
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await algorandService.getAllTransactions();
        res.status(200).json({
            success: true,
            data: transactions,
            count: transactions.length
        });
    }
    catch (error) {
        console.error("Get all transactions error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch transactions"
        });
    }
};
exports.getAllTransactions = getAllTransactions;
