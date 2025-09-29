import authService from './auth.service';

class CyclePaieService {
  // Obtenir la liste des cycles de paie
  getCyclesPaie(entrepriseId) {
    return authService.axios.get(`/entreprises/${entrepriseId}/cycles-paie`);
  }
  
  // Créer un nouveau cycle de paie
  creerCyclePaie(entrepriseId, cycleData) {
    return authService.axios.post(`/entreprises/${entrepriseId}/cycles-paie`, cycleData);
  }

  // Modifier un cycle de paie
  modifierCyclePaie(cycleId, cycleData) {
    return authService.axios.put(`/cycles-paie/${cycleId}`, cycleData);
  }

  // Supprimer un cycle de paie
  supprimerCycle(cycleId) {
    return authService.axios.delete(`/cycles-paie/${cycleId}`);
  }

  // Obtenir un cycle spécifique
  getCyclePaie(cycleId) {
    return authService.axios.get(`/cycles-paie/${cycleId}`);
  }

  // Pour les admins : obtenir tous les cycles
  getTousCycles() {
    return authService.axios.get(`/cycles-paie`);
  }
  
  // Obtenir les statistiques d'un cycle
  getStatistiquesCycle(cycleId) {
    return authService.axios.get(`/cycles-paie/${cycleId}/statistiques`);
  }
  
  // Générer les bulletins pour un cycle
  genererBulletins(cycleId) {
    return authService.axios.post(`/cycles-paie/${cycleId}/generer-bulletins`);
  }
  
  // Obtenir les bulletins d'un cycle
  getBulletinsCycle(cycleId) {
    return authService.axios.get(`/cycles-paie/${cycleId}/bulletins`);
  }
  
  // Approuver un cycle
  approuverCycle(cycleId) {
    return authService.axios.post(`/cycles-paie/${cycleId}/approuver`);
  }
  
  // Clôturer un cycle
  cloturerCycle(cycleId) {
    return authService.axios.post(`/cycles-paie/${cycleId}/cloturer`);
  }
  
  // Obtenir un bulletin spécifique
  getBulletin(bulletinId) {
    return authService.axios.get(`/bulletins/${bulletinId}`);
  }
  
  // Enregistrer un paiement pour un bulletin
  enregistrerPaiement(bulletinId, paiementData) {
    return authService.axios.post(`/bulletins/${bulletinId}/paiements`, paiementData);
  }
  
  // Obtenir les paiements d'un bulletin
  getPaiementsBulletin(bulletinId) {
    return authService.axios.get(`/bulletins/${bulletinId}/paiements`);
  }
  
  // Générer un PDF pour un paiement
  genererPdfPaiement(paiementId) {
    return authService.axios.get(`/paiements/${paiementId}/pdf`, { responseType: 'blob' });
  }
}

const cyclePaieService = new CyclePaieService();
export default cyclePaieService;