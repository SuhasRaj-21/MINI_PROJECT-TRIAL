import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL);

export const fetchLivePollution = async () => {
    const res = await axios.get(`${API_URL}/pollution/live`);
    return res.data;
};

export const addPollutionData = async (data) => {
    const res = await axios.post(`${API_URL}/pollution/add`, data);
    return res.data;
};
