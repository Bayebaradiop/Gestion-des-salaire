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

  // Alias pour la compatibilité - lister par employé
  async listerParEmploye(employeId, filtres = {}) {
    const params = new URLSearchParams();
    if (filtres.statut) {
      // Si statut est un tableau, le joindre avec des virgules
      const statutValue = Array.isArray(filtres.statut) ? filtres.statut.join(',') : filtres.statut;
      params.append('statut', statutValue);
    }
    
    const url = `/employes/${employeId}/bulletins${params.toString() ? '?' + params.toString() : ''}`;
    const response = await authService.axios.get(url);
    return response.data;
  }

  // Obtenir un bulletin par ID avec toutes ses informations
  async obtenirParId(bulletinId) {
    const response = await authService.axios.get(`/bulletins/${bulletinId}`);
    return response.data;
  }

  // Télécharger PDF avec gestion des erreurs
  async telechargerPDF(bulletinId) {
    try {
      const response = await authService.axios.get(`/bulletins/${bulletinId}/pdf`, {
        responseType: 'blob'
      });
      
      // Créer un URL pour le blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulletin-paie-${bulletinId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors du téléchargement du bulletin PDF');
    }
  }
}

const bulletinPaieService = new BulletinPaieService();
export default bulletinPaieService;