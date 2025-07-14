// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apisolvers.solversapp.com/api', // Cambia esto por tu URL base
});

export default api;
