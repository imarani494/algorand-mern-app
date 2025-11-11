import { Request, Response } from "express";
import * as algorandService from "../services/algorand.service";
import { sendTransactionSchema } from "../utils/validation";

/**
 * POST /api/algorand/send
 * Send ALGO transaction
 */
export const sendTransaction = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = sendTransactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: validationResult.error.issues // FIXED: Changed from .errors to .issues
      });
    }

    const { fromMnemonic, toAddress, amount, note } = validationResult.data;

    // Convert ALGO to microAlgos
    const amountInMicroAlgos = Math.round(amount * 1_000_000);

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
  } catch (error: any) {
    console.error("Send transaction error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send transaction"
    });
  }
};

/**
 * GET /api/algorand/status/:txId
 * Check transaction status
 */
export const getTransactionStatus = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error("Get transaction status error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check transaction status"
    });
  }
};

/**
 * GET /api/algorand/transactions
 * Get all transactions
 */
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await algorandService.getAllTransactions();

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error: any) {
    console.error("Get all transactions error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch transactions"
    });
  }
};
