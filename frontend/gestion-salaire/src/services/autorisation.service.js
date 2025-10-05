import authService from './auth.service';

class AutorisationService {
  
  /**
   * Obtenir l'état de l'accès Super-Admin pour l'entreprise courante
   */
  async obtenirEtatAcces(entrepriseId) {
    if (!entrepriseId) {
      throw new Error('EntrepriseId manquant');
    }

    try {
      const response = await authService.axios.get(`/entreprises/${entrepriseId}/autorisation`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'état d\'accès:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour l'autorisation d'accès Super-Admin
   */
  async mettreAJourAutorisation(entrepriseId, accesSuperAdminAutorise) {
    if (!entrepriseId) {
      throw new Error('EntrepriseId manquant');
    }
    
    if (typeof accesSuperAdminAutorise !== 'boolean') {
      throw new Error('accesSuperAdminAutorise doit être un booléen');
    }

    try {
      const response = await authService.axios.put(`/entreprises/${entrepriseId}/autorisation`, {
        accesSuperAdminAutorise
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'autorisation:', error);
      throw error;
    }
  }

  /**
   * Vérifier si l'accès Super-Admin est autorisé (pour les Super-Admins)
   */
  async verifierAccesAutorise(entrepriseId) {
    if (!entrepriseId) {
      throw new Error('EntrepriseId manquant');
    }

    try {
      const response = await authService.axios.get(`/entreprises/${entrepriseId}/autorisation/verifier`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'accès:', error);
      throw error;
    }
  }

  /**
   * Vérifier l'accès pour la navigation (retourne 403 si bloqué)
   */
  async verifierAccesNavigation(entrepriseId) {
    if (!entrepriseId) {
      throw new Error('EntrepriseId manquant');
    }

    try {
      const response = await authService.axios.get(`/entreprises/${entrepriseId}/autorisation/navigation`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'accès navigation:', error);
      
      // Si c'est une erreur 403, on la relance pour que le composant puisse l'intercepter
      if (error.response?.status === 403) {
        throw error;
      }
      
      throw error;
    }
  }
}

export default new AutorisationService();