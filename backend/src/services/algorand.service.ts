import algosdk from "algosdk";
import Transaction from "../models/Transaction.model";

// Initialize Algod client
const getAlgodClient = () => {
  const server =
    process.env.ALGOD_SERVER || "https://testnet-api.algonode.cloud";
  const port = process.env.ALGOD_PORT || "443";
  const token = process.env.ALGOD_TOKEN || "";

  return new algosdk.Algodv2(token, server, port);
};

export interface SendTransactionParams {
  fromMnemonic: string;
  toAddress: string;
  amount: number; // in microAlgos
  note?: string;
}

export interface TransactionResult {
  txId: string;
  confirmedRound?: number;
  status: "pending" | "confirmed" | "failed";
}

/**
 * Send ALGO transaction on Algorand TestNet
 */
export const sendTransaction = async (
  params: SendTransactionParams
): Promise<TransactionResult> => {
  try {
    const { fromMnemonic, toAddress, amount, note } = params;

    // Validate recipient address
    if (!algosdk.isValidAddress(toAddress)) {
      throw new Error("Invalid recipient address");
    }

    // Recover account from mnemonic
    const account = algosdk.mnemonicToSecretKey(fromMnemonic);

    // Initialize Algod client
    const algodClient = getAlgodClient();

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();

    // FIXED: Use correct parameter names for the method
    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
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
    let confirmedRound: number | undefined;
    let status: "pending" | "confirmed" | "failed" = "pending";

    try {
      // Use type assertion for confirmation response
      const confirmation = (await algosdk.waitForConfirmation(
        algodClient,
        txId,
        4
      )) as any;

      confirmedRound = confirmation["confirmed-round"];
      status = "confirmed";
    } catch (waitError) {
      console.warn(
        "Transaction submitted but confirmation timeout:",
        waitError
      );
      status = "pending";
    }

    // Save to database
    const transactionDoc = new Transaction({
      txId,
      from: account.addr,
      to: toAddress,
      amount: amount / 1_000_000, // Convert microAlgos to ALGO
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
  } catch (error: any) {
    console.error("Error sending transaction:", error);
    throw new Error(error.message || "Failed to send transaction");
  }
};

/**
 * Check transaction status
 */
export const checkTransactionStatus = async (
  txId: string
): Promise<TransactionResult> => {
  try {
    // Validate transaction ID format
    if (txId.length !== 52) {
      throw new Error("Invalid transaction ID format");
    }

    const algodClient = getAlgodClient();

    // Check transaction from blockchain
    let confirmedRound: number | undefined;
    let status: "pending" | "confirmed" | "failed" = "pending";

    try {
      // Use type assertion for transaction info
      const txInfo = (await algodClient
        .pendingTransactionInformation(txId)
        .do()) as any;

      if (txInfo["confirmed-round"]) {
        confirmedRound = txInfo["confirmed-round"];
        status = "confirmed";
      } else {
        status = "pending";
      }
    } catch (error: any) {
      // Transaction might not exist or failed
      if (error.status === 404 || error.message?.includes("not found")) {
        status = "failed";
      } else {
        throw error;
      }
    }

    // Update database
    const transactionDoc = await Transaction.findOneAndUpdate(
      { txId },
      {
        status,
        confirmedRound: confirmedRound || undefined
      },
      { new: true }
    );

    if (!transactionDoc) {
      // Transaction not in database, create it
      try {
        const txInfo = (await algodClient
          .pendingTransactionInformation(txId)
          .do()
          .catch(() => null)) as any;

        if (txInfo && txInfo.txn && txInfo.txn.txn) {
          const txn = txInfo.txn.txn;

          const newTransaction = new Transaction({
            txId,
            from: txn.snd ? algosdk.encodeAddress(txn.snd) : "unknown",
            to: txn.rcv ? algosdk.encodeAddress(txn.rcv) : "unknown",
            amount: txn.amt ? txn.amt / 1_000_000 : 0,
            status,
            confirmedRound: confirmedRound || undefined
          });
          await newTransaction.save();
        }
      } catch (dbError) {
        console.error("Error creating transaction record:", dbError);
      }
    }

    return {
      txId,
      confirmedRound,
      status
    };
  } catch (error: any) {
    console.error("Error checking transaction status:", error);
    throw new Error(error.message || "Failed to check transaction status");
  }
};

/**
 * Get all transactions from database
 */
export const getAllTransactions = async () => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(100);
    return transactions;
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};
