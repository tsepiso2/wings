// frontend/src/api.js
import axios from 'axios';

// Base URL points to deployed backend or local server
const api = axios.create({
  baseURL: "https://wings-backend.onrender.com/api",
});

export default api;
