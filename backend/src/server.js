const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const socketIo = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
    const Pollution = require('./models/Pollution');
    const count = await Pollution.countDocuments();
    if (count === 0) {
        console.log('Seeding mock pollution data...');
        const mockData = [
            { zone: 'Zone A', pm25: 55, pm10: 80, no2: 30, co: 1.5, temperature: 28, humidity: 65, vehicle_count: 1500, speed: 45, aqi: 130, risk_level: 'Unhealthy for Sensitive Groups', timestamp: new Date() },
            { zone: 'Zone B', pm25: 35, pm10: 50, no2: 20, co: 1.0, temperature: 29, humidity: 60, vehicle_count: 800, speed: 60, aqi: 85, risk_level: 'Moderate', timestamp: new Date() },
            { zone: 'Zone C', pm25: 110, pm10: 160, no2: 65, co: 3.5, temperature: 30, humidity: 55, vehicle_count: 3200, speed: 15, aqi: 220, risk_level: 'Very Unhealthy', timestamp: new Date() },
            { zone: 'Zone D', pm25: 20, pm10: 30, no2: 15, co: 0.5, temperature: 27, humidity: 70, vehicle_count: 400, speed: 70, aqi: 45, risk_level: 'Good', timestamp: new Date() },
        ];
        await Pollution.insertMany(mockData);
        console.log('Mock data seeded.');
    }

    // SIMULATE LIVE DATA STREAMING EVERY 5 SECONDS
    setInterval(async () => {
        const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        
        // Generate dynamic fluctuation
        const aqiBase = randomZone === 'Zone C' ? 200 : randomZone === 'Zone A' ? 120 : 60;
        const newAqi = Math.max(30, Math.floor(aqiBase + (Math.random() * 60 - 30)));
        const riskLevel = newAqi > 200 ? 'Very Unhealthy' : newAqi > 150 ? 'Unhealthy' : newAqi > 100 ? 'Unhealthy for Sensitive Groups' : newAqi > 50 ? 'Moderate' : 'Good';

        const newRecord = new Pollution({
            zone: randomZone,
            pm25: newAqi * 0.5,
            pm10: newAqi * 0.8,
            no2: newAqi * 0.3,
            co: newAqi * 0.02,
            temperature: 25 + Math.random() * 10,
            humidity: 50 + Math.random() * 20,
            vehicle_count: newAqi * 10,
            speed: Math.max(10, 80 - (newAqi * 0.2)),
            aqi: newAqi,
            risk_level: riskLevel,
            timestamp: new Date()
        });

        await newRecord.save();
        io.emit('newData', newRecord); // Push real-time event to React frontend!
    }, 5000); // Emit every 5 seconds
});

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    console.log('New client connected: ', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected: ', socket.id);
    });
});

app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
