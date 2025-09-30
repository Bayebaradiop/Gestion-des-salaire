import authService from './auth.service';

class EntrepriseService {
  // Obtenir la liste de toutes les entreprises
  getEntreprises() {
    return authService.axios.get('/entreprises');
  }
  
  // Obtenir les détails d'une entreprise spécifique
  getEntrepriseById(id) {
    return authService.axios.get(`/entreprises/${id}`);
  }

  // Obtenir les utilisateurs d'une entreprise
  getUtilisateursEntreprise(id) {
    return authService.axios.get(`/entreprises/${id}/utilisateurs`);
  }
  
  // Créer une nouvelle entreprise
  creerEntreprise(entrepriseData) {
    return authService.axios.post('/entreprises', entrepriseData);
  }
  
  // Modifier une entreprise existante
  modifierEntreprise(id, entrepriseData) {
    return authService.axios.put(`/entreprises/${id}`, entrepriseData);
  }
  
  // Supprimer une entreprise
  supprimerEntreprise(id) {
    return authService.axios.delete(`/entreprises/${id}`);
  }
  
  // Obtenir les statistiques d'une entreprise
  getStatistiquesEntreprise(id) {
    return authService.axios.get(`/entreprises/${id}/statistiques`);
  }

  // Créer un utilisateur pour une entreprise
  creerUtilisateurEntreprise(entrepriseId, utilisateurData) {
    return authService.axios.post(`/entreprises/${entrepriseId}/utilisateurs`, utilisateurData);
  }

  // Modifier un utilisateur d'une entreprise
  modifierUtilisateurEntreprise(entrepriseId, userId, utilisateurData) {
    return authService.axios.put(`/entreprises/${entrepriseId}/utilisateurs/${userId}`, utilisateurData);
  }

  // Supprimer un utilisateur d'une entreprise
  supprimerUtilisateurEntreprise(entrepriseId, userId) {
    return authService.axios.delete(`/entreprises/${entrepriseId}/utilisateurs/${userId}`);
  }

  // Activer/désactiver une entreprise
  toggleStatutEntreprise(entrepriseId) {
    return authService.axios.patch(`/entreprises/${entrepriseId}/toggle-statut`);
  }
}

const entrepriseService = new EntrepriseService();
export default entrepriseService;