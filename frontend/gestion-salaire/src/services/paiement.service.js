import authService from './auth.service';

class PaiementService {
  // Lister tous les paiements avec filtres
  async listerTous(filtres = {}) {
    const params = new URLSearchParams();
    
    if (filtres.page) params.append('page', filtres.page);
    if (filtres.limit) params.append('limit', filtres.limit);
    if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
    if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
    if (filtres.employeId) params.append('employeId', filtres.employeId);
    if (filtres.methodePaiement) params.append('methodePaiement', filtres.methodePaiement);
    
    const response = await authService.axios.get(`/paiements?${params.toString()}`);
    return response.data;
  }

  // Lister les paiements d'un bulletin
  async listerParBulletin(bulletinId) {
    const response = await authService.axios.get(`/bulletins/${bulletinId}/paiements`);
    return response.data;
  }

  // Obtenir un paiement par ID
  async obtenirParId(id) {
    const response = await authService.axios.get(`/paiements/${id}`);
    return response.data;
  }

  // Créer un nouveau paiement
  async creer(bulletinId, paiementData) {
    const response = await authService.axios.post(`/bulletins/${bulletinId}/paiements`, paiementData);
    return response.data;
  }

  // Modifier un paiement
  async modifier(id, paiementData) {
    const response = await authService.axios.put(`/paiements/${id}`, paiementData);
    return response.data;
  }

  // Supprimer un paiement
  async supprimer(id) {
    await authService.axios.delete(`/paiements/${id}`);
  }

  // Télécharger le reçu PDF
  async telechargerRecu(id) {
    const response = await authService.axios.get(`/paiements/${id}/pdf`, {
      responseType: 'blob'
    });
    
    // Créer un URL pour le blob et déclencher le téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `recu-paiement-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  }

  // Méthodes de paiement disponibles
  getMethodesPaiement() {
    return [
      { value: 'ESPECES', label: 'Espèces' },
      { value: 'VIREMENT_BANCAIRE', label: 'Virement bancaire' },
      { value: 'ORANGE_MONEY', label: 'Orange Money' },
      { value: 'WAVE', label: 'Wave' },
      { value: 'AUTRE', label: 'Autre' }
    ];
  }

  // Obtenir les bulletins non payés ou partiellement payés d'un employé
  async getBulletinsAPayer(employeId) {
    const response = await authService.axios.get(`/employes/${employeId}/bulletins?statut=EN_ATTENTE,PARTIEL`);
    return response.data;
  }
}

export default new PaiementService();