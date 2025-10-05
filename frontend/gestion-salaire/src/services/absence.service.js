import authService from './auth.service';

/**
 * Service Frontend pour gérer les absences et leur calcul automatique
 */
class AbsenceService {
  /**
   * Calculer et mettre à jour les absences pour un bulletin
   * @param {number} bulletinId 
   * @returns {Promise<Object>}
   */
  async calculerAbsencesBulletin(bulletinId) {
    const response = await authService.axios.post(`/bulletins/${bulletinId}/calculer-absences`);
    return response.data;
  }

  /**
   * Calculer et mettre à jour les absences pour tous les bulletins d'un cycle
   * @param {number} cycleId 
   * @returns {Promise<Object>}
   */
  async calculerAbsencesCycle(cycleId) {
    const response = await authService.axios.post(`/cycles/${cycleId}/calculer-absences`);
    return response.data;
  }

  /**
   * Obtenir les informations d'absences d'un bulletin
   * @param {number} bulletinId 
   * @returns {Promise<Object>}
   */
  async obtenirAbsencesBulletin(bulletinId) {
    const response = await authService.axios.get(`/bulletins/${bulletinId}/absences`);
    return response.data;
  }

  /**
   * Obtenir un bulletin avec toutes ses informations d'absences
   * @param {number} bulletinId 
   * @returns {Promise<Object>}
   */
  async obtenirBulletinAvecAbsences(bulletinId) {
    const response = await authService.axios.get(`/bulletins/${bulletinId}/avec-absences`);
    return response.data;
  }
}

export default new AbsenceService();