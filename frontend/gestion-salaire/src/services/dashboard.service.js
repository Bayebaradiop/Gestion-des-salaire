import axios from 'axios';
import { API_URL } from '../config';

// Créer une instance axios avec credentials pour inclure les cookies HTTP-only
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Service pour gérer les données du tableau de bord
 */
const dashboardService = {
  /**
   * Récupère les statistiques générales
   * @param {number} entrepriseId - ID de l'entreprise
   * @returns {Promise} - Promesse contenant les statistiques
   */
  async getStats(entrepriseId) {
    return api.get(`/entreprises/${entrepriseId}/dashboard/kpis`);
  },

  /**
   * Récupère les données pour les graphiques
   * @param {number} entrepriseId - ID de l'entreprise
   * @param {number} months - Nombre de mois à récupérer (par défaut 6)
   * @returns {Promise} - Promesse contenant les données
   */
  async getGraphData(entrepriseId, months = 6) {
    return api.get(`/entreprises/${entrepriseId}/dashboard/evolution-masse-salariale`);
  },

  /**
   * Vérifie si des données existent pour cette entreprise
   * @param {number} entrepriseId - ID de l'entreprise
   * @returns {Promise<boolean>} - Promesse contenant true si des données existent
   */
  async checkDataExists(entrepriseId) {
    try {
  const response = await api.get(`/entreprises/${entrepriseId}/dashboard/check-data`);
      return response.data.hasData;
    } catch (error) {
      console.error("Erreur lors de la vérification des données:", error);
      return false;
    }
  },

  /**
   * Initialise la base de données avec des valeurs par défaut
   * @param {number} entrepriseId - ID de l'entreprise
   * @returns {Promise} - Promesse confirmant l'initialisation
   */
  async initializeData(entrepriseId) {
    return api.post(`/dashboard/initialize`, { entrepriseId });
  },

  /**
   * Récupère les prochains paiements à effectuer
   * @param {number} entrepriseId - ID de l'entreprise
   * @param {number} limit - Nombre maximum de paiements à retourner
   * @returns {Promise} - Promesse contenant les paiements
   */
  async getNextPayments(entrepriseId, limit = 5) {
    return api.get(`/entreprises/${entrepriseId}/dashboard/prochains-paiements`, {
      params: { limit }
    });
  },

  /**
   * Récupère toutes les données du tableau de bord en un seul appel
   * @param {number} entrepriseId - ID de l'entreprise
   * @returns {Promise} - Promesse contenant toutes les données
   */
  async getDashboardData(entrepriseId) {
    return api.get(`/entreprises/${entrepriseId}/dashboard/all-data`);
  }
};

export default dashboardService;