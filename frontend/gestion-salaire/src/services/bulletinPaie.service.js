import authService from './auth.service';

class BulletinPaieService {
  // Obtenir un bulletin de paie par ID
  getBulletin(bulletinId) {
    return authService.axios.get(`/bulletins/${bulletinId}`);
  }
  
  // Télécharger le PDF d'un bulletin
  getBulletinPdf(bulletinId) {
    return authService.axios.get(`/bulletins/${bulletinId}/pdf`, { responseType: 'blob' });
  }
  
  // Enregistrer un paiement pour un bulletin
  enregistrerPaiement(bulletinId, paiementData) {
    return authService.axios.post(`/bulletins/${bulletinId}/paiements`, paiementData);
  }
  
  // Obtenir l'historique des paiements d'un bulletin
  getPaiementsBulletin(bulletinId) {
    return authService.axios.get(`/bulletins/${bulletinId}/paiements`);
  }

  // Obtenir tous les bulletins pour un employé
  getBulletinsEmploye(employeId) {
    return authService.axios.get(`/employes/${employeId}/bulletins`);
  }
  
  // Valider un bulletin
  validerBulletin(bulletinId) {
    return authService.axios.post(`/bulletins/${bulletinId}/valider`);
  }
  
  // Récupérer les détails d'un bulletin (avec les rubriques détaillées)
  getBulletinDetails(bulletinId) {
    return authService.axios.get(`/bulletins/${bulletinId}/details`);
  }
}

const bulletinPaieService = new BulletinPaieService();
export default bulletinPaieService;