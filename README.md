# Algorand MERN Transaction App

A full-stack MERN application for sending and tracking Algorand transactions on TestNet. Built with TypeScript, React, Express, MongoDB, and the Algorand JavaScript SDK.

![Algorand Wallet](https://img.shields.io/badge/Algorand-TestNet-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## 🚀 Features

- **Send ALGO Transactions**: Transfer ALGO tokens on Algorand TestNet
- **Transaction History**: View all past transactions with status tracking
- **Real-time Status**: Check transaction confirmation status
- **MongoDB Storage**: Persistent transaction history
- **TypeScript**: Full type safety for both frontend and backend
- **Responsive UI**: Modern, mobile-friendly interface

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Zod** for schema validation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose
- **Algorand SDK** for blockchain interactions
- **Zod** for request validation
- **CORS** for cross-origin requests

Project Structure

algorand-mern-app/
├── backend/ # Express.js API server
│ ├── src/
│ │ ├── config/ # Database configuration
│ │ ├── controllers/ # Route controllers
│ │ ├── models/ # MongoDB models
│ │ ├── routes/ # API routes
│ │ ├── services/ # Business logic
│ │ ├── middleware/ # Custom middleware
│ │ ├── utils/ # Utility functions
│ │ └── server.ts # Entry point
│ ├── .env.example # Environment variables template
│ ├── package.json
│ └── tsconfig.json
├── frontend/ # React application
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── services/ # API services
│ │ ├── lib/ # Utility functions
│ │ └── App.tsx # Main app component
│ ├── .env.example # Environment variables template
│ ├── package.json
│ └── vite.config.ts
└── README.md

 Backend Setup
bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

Frontend Setup
bash
cd frontend
npm install
cp .env.example .env
npm run dev


 API Endpoints
Method	Endpoint	Description
POST	/api/algorand/send	Send ALGO transaction
GET	/api/algorand/status/:txId	Check transaction status
GET	/api/algorand/transactions	Get all transactions



Backend (.env)
env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/algorand-transactions
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
ALGOD_TOKEN=
FRONTEND_URL=http://localhost:5173




Frontend (.env)
env
VITE_API_URL=http://localhost:5000

## 📁 Project Structure
