import axios from "axios";

// Fix: Use process.env for Vite environment variables or provide fallback
const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export interface SendTransactionRequest {
  fromMnemonic: string;
  toAddress: string;
  amount: number;
  note?: string;
}

export interface TransactionResponse {
  txId: string;
  confirmedRound?: number;
  status: "pending" | "confirmed" | "failed";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export const algorandApi = {
  sendTransaction: async (
    data: SendTransactionRequest
  ): Promise<ApiResponse<TransactionResponse>> => {
    const response = await api.post("/api/algorand/send", data);
    return response.data;
  },

  getTransactionStatus: async (
    txId: string
  ): Promise<ApiResponse<TransactionResponse>> => {
    const response = await api.get(`/api/algorand/status/${txId}`);
    return response.data;
  },

  getAllTransactions: async (): Promise<
    ApiResponse<
      Array<{
        _id: string;
        txId: string;
        from: string;
        to: string;
        amount: number;
        status: string;
        note?: string;
        createdAt: string;
        confirmedRound?: number;
      }>
    >
  > => {
    const response = await api.get("/api/algorand/transactions");
    return response.data;
  }
};
