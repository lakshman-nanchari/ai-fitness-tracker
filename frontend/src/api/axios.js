// frontend/src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/', // Update this to match your Django backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Optional: if using session/cookie-based auth
});

export default instance;
