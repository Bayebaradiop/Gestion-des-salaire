import authService from './auth.service';

/**
 * Service Frontend pour gérer les pointages (présence/absence)
 * 
 * Endpoints prévus côté backend:
 * - POST   /pointages/arrivee
 * - POST   /pointages/depart
 * - GET    /entreprises/:entrepriseId/pointages?du&au&employeId&statut
 * - GET    /entreprises/:entrepriseId/pointages/export?du&au   (PDF)
 */
class PointageService {
  /**
   * Lister les pointages d'une entreprise avec filtres optionnels
   * @param {number} entrepriseId
   * @param {Object} filters { du, au, employeId, statut, page, limit }
   * @returns {Promise<{ data: any }>} Axios response
   */
  async lister(entrepriseId, filters = {}) {
    let url = `/entreprises/${entrepriseId}/pointages`;

    const params = new URLSearchParams();
    if (filters.du) params.append('du', filters.du);
    if (filters.au) params.append('au', filters.au);
    if (filters.employeId) params.append('employeId', String(filters.employeId));
    if (filters.statut) params.append('statut', String(filters.statut));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const response = await authService.axios.get(url);
    return response.data;
  }

  /**
   * Enregistrer une arrivée (clock-in)
   * @param {Object} payload { entrepriseId, employeId, notes?, date? }
   * - date: ISO string ou YYYY-MM-DD (optionnel, défaut: maintenant côté backend)
   */
  async arriver({ entrepriseId, employeId, notes, date }) {
    const response = await authService.axios.post('/pointages/arrivee', {
      entrepriseId,
      employeId,
      notes,
      date
    });
    return response.data;
  }

  /**
   * Enregistrer un départ (clock-out)
   * @param {Object} payload { entrepriseId, employeId, notes?, date? }
   * - date: ISO string ou YYYY-MM-DD (optionnel, défaut: maintenant côté backend)
   */
  async depart({ entrepriseId, employeId, notes, date }) {
    const response = await authService.axios.post('/pointages/depart', {
      entrepriseId,
      employeId,
      notes,
      date
    });
    return response.data;
  }

  /**
   * Créer une absence automatique (pour marquage à 12h00)
   * @param {Object} payload { entrepriseId, employeId, date, statut, notes, marqueAutomatiquement }
   */
  async creerAbsence({ entrepriseId, employeId, date, statut = 'ABSENT', notes, marqueAutomatiquement = true }) {
    const response = await authService.axios.post('/pointages/absence', {
      entrepriseId,
      employeId,
      date,
      statut,
      notes,
      marqueAutomatiquement,
      heureMarquage: new Date().toTimeString().slice(0, 8) // HH:MM:SS
    });
    return response.data;
  }

  /**
   * Exporter en PDF les pointages d'une période
   * @param {number} entrepriseId
   * @param {Object} options { du, au, filename? }
   * - du, au: YYYY-MM-DD (ou ISO) requis côté backend
   * - filename: nom du fichier de sortie (optionnel)
   */
  async exporterPdf(entrepriseId, { du, au, filename }) {
    const params = new URLSearchParams();
    if (du) params.append('du', du);
    if (au) params.append('au', au);

    const url = `/entreprises/${entrepriseId}/pointages/export?${params.toString()}`;

    const response = await authService.axios.get(url, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const defaultName = this._defaultPdfName(du, au);
    this._downloadBlob(blob, filename || defaultName);
    return true;
  }

  /**
   * Génère un nom de fichier par défaut
   */
  _defaultPdfName(du, au) {
    const safe = (s) => (s || '').replaceAll(':', '-').replaceAll(' ', '_');
    return `rapport-pointages_${safe(du)}_${safe(au)}.pdf`;
  }

  /**
   * Déclenche le téléchargement d'un Blob
   */
  _downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'rapport-pointages.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}

const pointageService = new PointageService();
export default pointageService;
