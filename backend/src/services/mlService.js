const axios = require('axios');

const predictAqi = async (data) => {
    try {
        const response = await axios.post(`${process.env.ML_API_URL}/predict`, data);
        return response.data;
    } catch (error) {
        console.error("ML Service Error:", error.message);
        throw new Error("Failed to connect to ML Service");
    }
};

module.exports = { predictAqi };
