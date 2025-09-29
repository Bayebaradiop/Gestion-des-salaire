// Configuration de l'API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Autres configurations
export const APP_CONFIG = {
  name: 'Gestion des Salaires',
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
  apiUrl: API_URL,
  timeout: 10000, // 10 secondes
};

export default {
  API_URL,
  APP_CONFIG
};