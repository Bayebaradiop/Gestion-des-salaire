import authService from './auth.service';

/**
 * Service Frontend pour gérer les calculs automatiques des salaires
 * (absences pour employés fixes, jours travaillés pour journaliers)
 */
class CalculSalaireService {
  /**
   * Calculer et mettre à jour un bulletin avec les données de pointage
   * @param {number} bulletinId
   * @returns {Promise<any>}
   */
  async calculerEtMettreAJourBulletin(bulletinId) {
    const response = await authService.axios.post(`/bulletins/${bulletinId}/calculer-absences`);
    return response.data;
  }

  /**
   * Obtenir les informations de calcul pour un bulletin
   * @param {number} bulletinId
   * @returns {Promise<any>}
   */
  async obtenirInfosCalcul(bulletinId) {
    try {
      const response = await authService.axios.get(`/bulletins/${bulletinId}/absences`);
      
      // S'assurer que les valeurs numériques ne sont pas NaN
      const data = response.data;
      
      // Pour les journaliers
      if (data.tauxJournalier && isNaN(data.tauxJournalier)) {
        data.tauxJournalier = 0;
      }
      if (data.nombreJoursTravailles && isNaN(data.nombreJoursTravailles)) {
        data.nombreJoursTravailles = 0;
      }
      
      // Pour les honoraires
      if (data.totalHeuresTravaillees && isNaN(data.totalHeuresTravaillees)) {
        data.totalHeuresTravaillees = 0;
      }
      if (data.tauxHoraire && isNaN(data.tauxHoraire)) {
        data.tauxHoraire = 0;
      }
      
      // Pour les mensuels
      if (data.nombreAbsences && isNaN(data.nombreAbsences)) {
        data.nombreAbsences = 0;
      }
      if (data.montantDeduction && isNaN(data.montantDeduction)) {
        data.montantDeduction = 0;
      }
      
      // Commun à tous
      if (data.salaireBrut && isNaN(data.salaireBrut)) {
        data.salaireBrut = 0;
      }
      if (data.salaireNet && isNaN(data.salaireNet)) {
        data.salaireNet = 0;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des infos de calcul:', error);
      throw error;
    }
  }

  /**
   * Calculer le salaire d'un employé journalier
   * @param {number} employeId
   * @param {number} cyclePaieId
   * @returns {Promise<any>}
   */
  async calculerSalaireJournalier(employeId, cyclePaieId) {
    const response = await authService.axios.post('/calcul-salaire/journalier', {
      employeId,
      cyclePaieId
    });
    return response.data;
  }

  /**
   * Calculer les absences d'un employé fixe
   * @param {number} employeId
   * @param {number} cyclePaieId
   * @returns {Promise<any>}
   */
  async calculerAbsencesFixe(employeId, cyclePaieId) {
    const response = await authService.axios.post('/calcul-salaire/fixe', {
      employeId,
      cyclePaieId
    });
    return response.data;
  }
}

const calculSalaireService = new CalculSalaireService();
export default calculSalaireService;