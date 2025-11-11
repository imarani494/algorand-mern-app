import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { algorandApi, TransactionResponse } from "@/services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";
import { Alert } from "./ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./ui/table";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  History,
  Wallet,
  ArrowRight
} from "lucide-react";

// Fix: Use proper Zod schema with string input that gets converted to number
const transactionSchema = z.object({
  fromMnemonic: z.string().min(1, "Mnemonic is required"),
  toAddress: z.string().min(1, "Recipient address is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number"
    })
    .refine((val) => parseFloat(val) >= 0.001, {
      message: "Minimum amount is 0.001 ALGO"
    }),
  note: z.string().optional()
});

// Fix: Create proper type that matches the form input (all strings)
type TransactionFormInput = z.infer<typeof transactionSchema>;

// Fix: Create separate type for the data we send to API (with number amount)
interface TransactionFormData {
  fromMnemonic: string;
  toAddress: string;
  amount: number;
  note?: string;
}

interface TransactionRecord {
  _id: string;
  txId: string;
  from: string;
  to: string;
  amount: number;
  status: string;
  note?: string;
  createdAt: string;
  confirmedRound?: number;
}

export const TransactionForm = () => {
  const [loading, setLoading] = useState(false);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);

  // Fix: Use TransactionFormInput for useForm (all string inputs)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      toAddress: "TW3A3ZK4HPAQ3FGBGGQJW6CA67U65M4TDKH3DH645EYL46P37NA2T6Z2MI",
      amount: "0.001"
    }
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactionResult?.status === "pending" && transactionResult.txId) {
      const interval = setInterval(() => {
        checkStatus(transactionResult.txId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [transactionResult]);

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await algorandApi.getAllTransactions();
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const checkStatus = async (txId: string) => {
    setCheckingStatus(txId);
    try {
      const response = await algorandApi.getTransactionStatus(txId);
      if (response.success && response.data) {
        setTransactionResult(response.data);
        fetchTransactions();
      }
    } catch (err: any) {
      console.error("Error checking status:", err);
    } finally {
      setCheckingStatus(null);
    }
  };

  // Fix: Convert form data (strings) to API data (with number)
  const onSubmit = async (formData: TransactionFormInput) => {
    setLoading(true);
    setError(null);
    setTransactionResult(null);

    try {
      // Convert string amount to number for API
      const apiData: TransactionFormData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      const response = await algorandApi.sendTransaction(apiData);

      if (response.success && response.data) {
        setTransactionResult(response.data);
        reset();
        fetchTransactions();
      } else {
        setError(response.error || "Failed to send transaction");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to send transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "confirmed":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-3 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Algorand Wallet
          </h1>
        </div>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
          Send and track ALGO transactions on the Algorand TestNet
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Send Transaction Card */}
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg pb-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <CardTitle className="text-white text-xl">Send ALGO</CardTitle>
            </div>
            <CardDescription className="text-blue-100">
              Transfer ALGO tokens on Algorand TestNet
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="fromMnemonic"
                    className="text-gray-700 font-medium"
                  >
                    Sender Mnemonic
                  </Label>
                  <Input
                    id="fromMnemonic"
                    type="password"
                    placeholder="Enter your 25-word mnemonic phrase"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...register("fromMnemonic")}
                  />
                  {errors.fromMnemonic && (
                    <p className="text-sm text-red-600">
                      {errors.fromMnemonic.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="toAddress"
                    className="text-gray-700 font-medium"
                  >
                    Recipient Address
                  </Label>
                  <Input
                    id="toAddress"
                    placeholder="Enter recipient Algorand address"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...register("toAddress")}
                  />
                  {errors.toAddress && (
                    <p className="text-sm text-red-600">
                      {errors.toAddress.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700 font-medium">
                    Amount (ALGO)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.001"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...register("amount")}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-gray-700 font-medium">
                    Note (Optional)
                  </Label>
                  <Input
                    id="note"
                    placeholder="Add a transaction note"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...register("note")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Transaction
                  </>
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="error" className="mt-4 border-red-300 bg-red-50">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </Alert>
            )}

            {transactionResult && (
              <Alert
                variant={
                  transactionResult.status === "confirmed"
                    ? "success"
                    : transactionResult.status === "failed"
                    ? "error"
                    : "warning"
                }
                className="mt-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transactionResult.status)}
                    <div>
                      <p className="font-medium capitalize">
                        Transaction {transactionResult.status}
                      </p>
                      <p className="text-sm opacity-90 font-mono">
                        ID: {transactionResult.txId}
                      </p>
                    </div>
                  </div>
                  {checkingStatus && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Transaction History Card */}
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg pb-4">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <CardTitle className="text-white text-xl">
                Transaction History
              </CardTitle>
            </div>
            <CardDescription className="text-purple-100">
              Recent transactions from your wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loadingTransactions ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <History className="h-12 w-12 text-gray-300 mx-auto" />
                <div>
                  <p className="text-gray-500 font-medium">
                    No transactions yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Your transaction history will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">
                        From → To
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Amount
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow
                        key={transaction._id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {truncateAddress(transaction.from)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {truncateAddress(transaction.to)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded text-sm">
                            {transaction.amount} ALGO
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className={getStatusBadge(transaction.status)}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">
                              {transaction.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-2">
              Using Algorand TestNet
            </h3>
            <p className="text-gray-600 text-sm">
              Get test ALGO tokens from{" "}
              <a
                href="https://bank.testnet.algorand.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Algorand TestNet Dispenser
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
