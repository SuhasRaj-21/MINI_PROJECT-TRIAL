const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const pollutionRoutes = require('./routes/pollutionRoutes');
const advancedRoutes = require('./routes/advancedRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/pollution', (req, res, next) => {
    // Inject io into req
    req.io = req.app.get('io');
    next();
}, pollutionRoutes);

app.use('/api/advanced', advancedRoutes);

app.get('/', (req, res) => {
    res.send('Backend is running');
});

module.exports = app;
