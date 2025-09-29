import authService from './auth.service';

class EntrepriseService {
  // Obtenir la liste de toutes les entreprises
  getEntreprises() {
    return authService.axios.get('/entreprises');
  }
  
  // Obtenir les détails d'une entreprise spécifique
  getEntreprise(id) {
    return authService.axios.get(`/entreprises/${id}`);
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
}

const entrepriseService = new EntrepriseService();
export default entrepriseService;