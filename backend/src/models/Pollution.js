const mongoose = require('mongoose');

const PollutionSchema = new mongoose.Schema({
    zone: { type: String, required: true },
    pm25: { type: Number, required: true },
    pm10: { type: Number, required: true },
    no2: { type: Number, required: true },
    co: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    vehicle_count: { type: Number, required: true },
    speed: { type: Number, required: true },
    aqi: { type: Number, required: true },
    risk_level: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pollution', PollutionSchema);
