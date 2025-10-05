import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const API_BASE = '/paiements-journaliers';

// Instance axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const paiementJournalierService = {
  /**
   * Calcule le paiement dû pour un employé journalier
   */
  async calculerPaiement(employeId, mois, annee) {
    try {
      const response = await api.post(`${API_BASE}/calculer`, {
        employeId,
        mois,
        annee
      });
      return response.data;
    } catch (error) {
      console.error('Erreur calcul paiement journalier:', error);
      throw error;
    }
  },

  /**
   * Enregistre un paiement manuel pour un employé journalier
   */
  async enregistrerPaiement(donnees) {
    try {
      const response = await api.post(`${API_BASE}/enregistrer`, donnees);
      return response.data;
    } catch (error) {
      console.error('Erreur enregistrement paiement:', error);
      throw error;
    }
  },

  /**
   * Liste tous les employés journaliers avec leur statut de paiement
   */
  async listerEmployesJournaliers(mois, annee) {
    try {
      const params = {};
      if (mois) params.mois = mois;
      if (annee) params.annee = annee;

      const response = await api.get(`${API_BASE}/employes`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur listage employés journaliers:', error);
      throw error;
    }
  },

  /**
   * Obtient l'historique des paiements journaliers
   */
  async obtenirHistorique(filtres = {}) {
    try {
      const response = await api.get(`${API_BASE}/historique`, { 
        params: filtres 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur historique paiements:', error);
      throw error;
    }
  },

  /**
   * Obtient le détail du calcul pour un employé
   */
  async obtenirDetailCalcul(employeId, mois, annee) {
    try {
      const params = {};
      if (mois) params.mois = mois;
      if (annee) params.annee = annee;

      const response = await api.get(`${API_BASE}/detail/${employeId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur détail calcul:', error);
      throw error;
    }
  },

  /**
   * Formate le type de contrat pour l'affichage
   */
  obtenirLabelTypeContrat(typeContrat) {
    const labels = {
      JOURNALIER: 'Journalier',
      FIXE: 'Mensuel fixe',
      HONORAIRE: 'Honoraire'
    };
    return labels[typeContrat] || typeContrat;
  },

  /**
   * Formate la méthode de paiement pour l'affichage
   */
  obtenirLabelMethodePaiement(methodePaiement) {
    const labels = {
      ESPECES: 'Espèces',
      VIREMENT_BANCAIRE: 'Virement bancaire',
      ORANGE_MONEY: 'Orange Money',
      WAVE: 'Wave',
      AUTRE: 'Autre'
    };
    return labels[methodePaiement] || methodePaiement;
  },

  /**
   * Formate le montant en XOF
   */
  formaterMontant(montant) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  },

  /**
   * Calcule le pourcentage payé
   */
  calculerPourcentagePaye(montantPaye, salaireNet) {
    if (salaireNet === 0) return 0;
    return Math.round((montantPaye / salaireNet) * 100);
  },

  /**
   * Vérifie si un employé a besoin d'un paiement
   */
  aBesoinPaiement(employe) {
    return employe.hasPointages && employe.resteAPayer > 0;
  },

  /**
   * Obtient le statut de paiement d'un employé
   */
  obtenirStatutPaiement(employe) {
    if (!employe.hasPointages) {
      return { label: 'Pas de pointages', color: 'gray', icon: '⏰' };
    }
    
    if (employe.resteAPayer === 0) {
      return { label: 'Payé intégralement', color: 'green', icon: '✅' };
    }
    
    if (employe.totalDejaPaye > 0) {
      return { label: 'Payé partiellement', color: 'orange', icon: '🔄' };
    }
    
    return { label: 'En attente de paiement', color: 'red', icon: '❌' };
  },

  /**
   * Valide les données avant envoi
   */
  validerDonneesPaiement(donnees) {
    const erreurs = [];

    if (!donnees.employeId) {
      erreurs.push('Employé requis');
    }

    if (!donnees.mois || donnees.mois < 1 || donnees.mois > 12) {
      erreurs.push('Mois invalide');
    }

    if (!donnees.annee || donnees.annee < 2020 || donnees.annee > 2030) {
      erreurs.push('Année invalide');
    }

    if (!donnees.montantPaye || donnees.montantPaye <= 0) {
      erreurs.push('Montant à payer requis et doit être supérieur à 0');
    }

    if (!donnees.methodePaiement) {
      erreurs.push('Méthode de paiement requise');
    }

    return erreurs;
  }
};

export default paiementJournalierService;