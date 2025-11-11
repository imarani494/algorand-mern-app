import { z } from "zod";
import algosdk from "algosdk";

export const sendTransactionSchema = z.object({
  fromMnemonic: z
    .string()
    .min(1, "Mnemonic is required")
    .refine(
      (mnemonic) => {
        try {
          algosdk.mnemonicToSecretKey(mnemonic);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid mnemonic format" }
    ),
  toAddress: z
    .string()
    .min(1, "Recipient address is required")
    .refine((address) => algosdk.isValidAddress(address), {
      message: "Invalid Algorand address format"
    }),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(0.001, "Minimum amount is 0.001 ALGO"),
  note: z.string().optional()
});

export const txIdSchema = z.object({
  txId: z.string().length(52, "Transaction ID must be 52 characters")
});
