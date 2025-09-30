import authService from './auth.service';

class EmployeService {
  // Obtenir la liste des employés d'une entreprise
  getEmployesByEntreprise(entrepriseId) {
    return authService.axios.get(`/entreprises/${entrepriseId}/employes`);
  }

  // Obtenir la liste des employés avec filtres optionnels
  getEmployes(entrepriseId, filters = {}) {
    let url = `/entreprises/${entrepriseId}/employes`;
    
    // Ajouter les filtres à l'URL (seulement si non vides)
    const queryParams = new URLSearchParams();
    if (filters.estActif && filters.estActif !== '') {
      queryParams.append('estActif', filters.estActif);
    }
    if (filters.typeContrat && filters.typeContrat !== '') {
      queryParams.append('typeContrat', filters.typeContrat);
    }
    if (filters.poste && filters.poste !== '') {
      queryParams.append('poste', filters.poste);
    }
    
    // Ajouter les paramètres à l'URL si présents
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return authService.axios.get(url);
  }
  
  // Obtenir les statistiques des employés
  getStatistiquesEmployes(entrepriseId) {
    return authService.axios.get(`/entreprises/${entrepriseId}/employes/statistiques`);
  }
  
  // Créer un nouvel employé
  creerEmploye(entrepriseId, employeData) {
    return authService.axios.post(`/entreprises/${entrepriseId}/employes`, employeData);
  }
  
  // Modifier un employé existant
  modifierEmploye(employeId, employeData) {
    return authService.axios.put(`/employes/${employeId}`, employeData);
  }
  
  // Activer un employé
  activerEmploye(employeId) {
    return authService.axios.post(`/employes/${employeId}/activer`);
  }
  
  // Désactiver un employé
  desactiverEmploye(employeId) {
    return authService.axios.post(`/employes/${employeId}/desactiver`);
  }

  // Supprimer un employé
  supprimerEmploye(employeId) {
    return authService.axios.delete(`/employes/${employeId}`);
  }

  // Obtenir un employé par ID
  getEmploye(employeId) {
    return authService.axios.get(`/employes/${employeId}`);
  }
}

const employeService = new EmployeService();
export default employeService;