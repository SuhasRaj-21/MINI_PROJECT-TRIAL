const axios = require('axios');

const predictAqi = async (data) => {
    try {
        const mlUrl = process.env.ML_API_URL || 'http://127.0.0.1:8000';
        const response = await axios.post(`${mlUrl}/predict`, data, {
            timeout: 5000 // 5 seconds timeout
        });
        return response.data;
    } catch (error) {
        console.error("ML Service Error:");
        if (error.response) {
            console.error("Data:", error.response.data);
            console.error("Status:", error.response.status);
            throw new Error(`ML API Error: ${error.response.data.detail || 'Unknown error'}`);
        } else if (error.request) {
            console.error("No response received from ML API.");
            throw new Error("ML Service is down or unreachable.");
        } else {
            console.error("Error setting up request:", error.message);
            throw new Error("Failed to connect to ML Service.");
        }
    }
};

module.exports = { predictAqi };
