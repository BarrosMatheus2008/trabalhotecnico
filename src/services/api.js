import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Na web, usamos localhost em vez de 10.0.2.2 ou IP de rede
});

export default api;