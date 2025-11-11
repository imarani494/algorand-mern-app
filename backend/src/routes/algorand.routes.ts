import { Router } from "express";
import {
  sendTransaction,
  getTransactionStatus,
  getAllTransactions
} from "../controllers/algorand.controller";

const router = Router();

router.post("/send", sendTransaction);
router.get("/status/:txId", getTransactionStatus);
router.get("/transactions", getAllTransactions);

export default router;
