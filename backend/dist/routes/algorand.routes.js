"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const algorand_controller_1 = require("../controllers/algorand.controller");
const router = (0, express_1.Router)();
router.post("/send", algorand_controller_1.sendTransaction);
router.get("/status/:txId", algorand_controller_1.getTransactionStatus);
router.get("/transactions", algorand_controller_1.getAllTransactions);
exports.default = router;
