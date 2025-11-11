import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.json({ 
    status: 'ok', 
    message: 'Algorand Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api/algorand/transactions', (req, res) => {
  console.log('Transactions endpoint called');
  res.json({
    success: true,
    data: [],
    message: 'Transactions endpoint working'
  });
});

app.post('/api/algorand/send', (req, res) => {
  console.log('Send endpoint called', req.body);
  res.json({
    success: true,
    data: {
      txId: 'TEST_' + Date.now(),
      status: 'pending'
    },
    message: 'Send endpoint working'
  });
});

app.get('/api/algorand/status/:txId', (req, res) => {
  console.log('Status endpoint called for:', req.params.txId);
  res.json({
    success: true,
    data: {
      txId: req.params.txId,
      status: 'confirmed'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});