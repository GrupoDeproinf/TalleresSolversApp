// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://desarrollo-test.com/', // Cambia esto por tu URL base
});

export default api;
