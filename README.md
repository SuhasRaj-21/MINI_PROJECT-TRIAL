# Decentralized Traffic Emission Tracking and Predictive Pollution Management System

## Overview
This is a full-stack, 4-module system designed to predict traffic-based pollution, track real-time AQI across zones, and securely log critical emission events to a Polygon-based blockchain ledger.

## Architecture
1. **Frontend**: React + Vite + TailwindCSS + Leaflet + Chart.js + Socket.IO
2. **Backend**: Node.js + Express + MongoDB + Socket.IO + Ethers.js
3. **ML Service**: FastAPI + Scikit-Learn (Random Forest) + Pandas
4. **Blockchain**: Solidity + Hardhat + Polygon

### Quick Start (All Services)
We have configured a root `package.json` with `concurrently` so you can launch all 4 services with a single command!

```bash
cd traffic-emission-system
npm install
npm run start:all
```
*Note: Make sure your MongoDB is running locally, and you have trained the ML model using `python -m app.models.train` at least once.*

---

### Individual Setup Instructions

### 1. Blockchain Module (`/blockchain`)
This module handles secure logging of hazardous AQI levels.
```bash
cd blockchain
npm install
npx hardhat node # Terminal 1: Run local node
npx hardhat run scripts/deploy.js --network localhost # Terminal 2: Deploy contract
```
*Note: Ensure to update the `CONTRACT_ADDRESS` in the backend `.env`.*

### 2. ML Service (`/ml-service`)
This module provides the AQI prediction engine.
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.models.train  # Train the model first
uvicorn app.main:app --reload --port 8000 # Run API
```

### 3. Backend Module (`/backend`)
Acts as the central controller connecting Frontend, MongoDB, ML, and Blockchain.
```bash
cd backend
npm install
# Ensure MongoDB is running locally or provide MongoDB Atlas URI in .env
npm start
```

### 4. Frontend Module (`/frontend`)
The user interface for the system.
```bash
cd frontend
npm install
npm run dev
```

---
## Features
- **Real-time Live Map**: Interactive map displaying pollution heatmaps across zones.
- **AI Prediction**: ML models predicting AQI for the next 1h to 24h.
- **Blockchain Logging**: High pollution risks are securely logged on the blockchain to prevent tampering.
- **Route Planner**: Finds the cleanest vs. fastest routes based on pollution levels.

*Developed for demo and academic portfolio showcase.*
