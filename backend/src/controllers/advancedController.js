const Pollution = require('../models/Pollution');

exports.getSustainabilityScore = async (req, res) => {
    try {
        const records = await Pollution.find().sort({ timestamp: -1 }).limit(100);
        if (!records.length) return res.status(200).json({ score: 100, status: 'Excellent' });

        const avgAqi = records.reduce((acc, curr) => acc + curr.aqi, 0) / records.length;
        const avgTraffic = records.reduce((acc, curr) => acc + curr.vehicle_count, 0) / records.length;
        
        // Complex heuristic for sustainability
        const score = Math.max(10, Math.min(100, 100 - (avgAqi / 3) - (avgTraffic / 1000)));
        const status = score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Moderate' : 'Poor';

        res.status(200).json({
            sustainability_score: score.toFixed(2),
            status,
            analyzed_records: records.length,
            timestamp: new Date()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to compute sustainability score' });
    }
};

exports.getCityHealthIndex = async (req, res) => {
    try {
        const records = await Pollution.find().sort({ timestamp: -1 }).limit(50);
        const avgAqi = records.reduce((acc, curr) => acc + curr.aqi, 0) / (records.length || 1);
        
        let grade = 'F';
        if (avgAqi < 50) grade = 'A+';
        else if (avgAqi < 100) grade = 'B';
        else if (avgAqi < 150) grade = 'C';
        else if (avgAqi < 200) grade = 'D';

        res.status(200).json({
            city_health_grade: grade,
            average_aqi: avgAqi.toFixed(2),
            recommendation: grade === 'A+' ? 'Maintain current emission caps.' : 'Immediate traffic diversion required in central zones.'
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to compute city health index' });
    }
};

exports.recommendRoute = async (req, res) => {
    try {
        const { source, destination } = req.body;
        // Mocked AI routing engine logic
        const simulatedExposure = Math.floor(Math.random() * 50) + 40;
        const recommended = {
            route_name: "Outer Ring Road Diversion",
            estimated_time: "45 mins",
            aqi_exposure: simulatedExposure,
            risk_level: simulatedExposure > 100 ? "Moderate" : "Low",
            message: "This route avoids the central industrial zone, reducing PM2.5 exposure by 40%."
        };

        res.status(200).json({
            source,
            destination,
            recommendation: recommended
        });
    } catch (err) {
        res.status(500).json({ error: 'Routing AI failed' });
    }
};
