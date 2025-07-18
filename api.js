// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Cambia esto por tu URL base
});

export default api;
