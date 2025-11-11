import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Algorand Backend is running!",
    timestamp: new Date().toISOString()
  });
});

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    data: {
      algodServer: process.env.ALGOD_SERVER,
      port: process.env.PORT
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Algorand TestNet API: ${process.env.ALGOD_SERVER}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});
