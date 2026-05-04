const Pollution = require('../models/Pollution');
const { predictAqi } = require('../services/mlService');
const { logToBlockchain } = require('../services/blockchainService');

const getLivePollution = async (req, res) => {
    try {
        const data = await Pollution.find().sort({ timestamp: -1 }).limit(50);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addPollutionData = async (req, res) => {
    try {
        const { zone, pm25, pm10, no2, co, temperature, humidity, vehicle_count, speed } = req.body;
        
        // Call ML service to get prediction
        const prediction = await predictAqi({
            pm25, pm10, no2, co, temperature, humidity, vehicle_count, speed
        });

        const newPollution = new Pollution({
            zone, pm25, pm10, no2, co, temperature, humidity, vehicle_count, speed,
            aqi: prediction.aqi_1hr,
            risk_level: prediction.risk_level
        });

        await newPollution.save();

        // If risk is high, log to blockchain
        if (prediction.risk_level === 'Hazardous' || prediction.risk_level === 'Very Unhealthy') {
            await logToBlockchain(zone, prediction.aqi_1hr, prediction.risk_level);
        }

        req.io.emit('newData', newPollution);

        res.status(201).json({ message: 'Data added successfully', data: newPollution });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getLivePollution, addPollutionData };
