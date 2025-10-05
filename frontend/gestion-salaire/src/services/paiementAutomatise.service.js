import authService from './auth.service';

/**
 * Service pour gérer les paiements automatisés basés sur les pointages
 * Intègre la séparation des rôles Admin/Caissier et validation des pointages
 */
class PaiementAutomatiseService {

  /**
   * Calculer le montant dû pour un employé sur une période
   * RESTRICTION : Seuls les CAISSIER peuvent calculer les paiements
   * VALIDATION : Nécessite que les pointages soient validés par un admin
   */
  async calculerPaiement(employeId, periode) {
    try {
      const response = await authService.axios.post(`/paiements/calculer/${employeId}`, {
        periode
      });
      return response.data;
    } catch (error) {
      // Gestion spéciale des erreurs de pointages non validés
      if (error.response?.data?.type === 'POINTAGES_NON_VALIDES') {
        throw {
          ...error,
          message: error.response.data.message,
          type: 'POINTAGES_NON_VALIDES'
        };
      }
      console.error('Erreur lors du calcul du paiement:', error);
      throw error;
    }
  }

  /**
   * Enregistrer un paiement automatisé
   * RESTRICTION : Seuls les CAISSIER peuvent enregistrer les paiements
   */
  async enregistrerPaiement(employeId, periode) {
    try {
      const response = await authService.axios.post(`/paiements/enregistrer/${employeId}`, {
        periode
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.type === 'POINTAGES_NON_VALIDES') {
        throw {
          ...error,
          message: error.response.data.message,
          type: 'POINTAGES_NON_VALIDES'
        };
      }
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les paiements automatisés d'une entreprise
   * ACCESSIBLE : ADMIN et CAISSIER
   * Inclut la traçabilité (qui a validé, qui a calculé, qui a payé)
   */
  async obtenirPaiementsEntreprise(entrepriseId, periode = null) {
    try {
      const params = periode ? `?periode=${periode}` : '';
      const response = await authService.axios.get(`/paiements/entreprises/${entrepriseId}/paiements-automatises${params}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      throw error;
    }
  }

  /**
   * Valider les pointages d'une période (ADMIN uniquement)
   * RESTRICTION : Seuls les ADMIN peuvent valider les pointages
   */
  async validerPointagesPeriode(employeId, periode) {
    try {
      const response = await authService.axios.post(`/paiements/admin/pointages/valider`, {
        employeId,
        periode
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation des pointages:', error);
      throw error;
    }
  }

  /**
   * Vérifier le statut de validation des pointages d'une période
   * ACCESSIBLE : ADMIN et CAISSIER
   */
  async verifierValidationPointages(employeId, periode) {
    try {
      const response = await authService.axios.get(`/paiements/pointages/validation-status/${employeId}/${periode}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification de validation:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails d'un paiement automatisé
   */
  async obtenirDetailsPaiement(paiementId) {
    try {
      const response = await authService.axios.get(`/paiements/${paiementId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      throw error;
    }
  }

  /**
   * Marquer un paiement comme payé (partiellement ou totalement)
   * RESTRICTION : Seuls les CAISSIER peuvent marquer comme payé
   */
  async marquerCommePaye(paiementId, montantPaye, methodePaiement, notes = '') {
    try {
      const response = await authService.axios.put(`/paiements/${paiementId}/marquer-paye`, {
        montantPaye,
        methodePaiement,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      throw error;
    }
  }

  /**
   * Générer la période actuelle (format YYYY-MM)
   */
  genererPeriodeActuelle() {
    const now = new Date();
    const annee = now.getFullYear();
    const mois = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${annee}-${mois}`;
  }

  /**
   * Générer une liste de périodes (pour les sélecteurs)
   */
  genererListePeriodes(nombreMois = 6) {
    const periodes = [];
    const now = new Date();
    
    for (let i = 0; i < nombreMois; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const annee = date.getFullYear();
      const mois = (date.getMonth() + 1).toString().padStart(2, '0');
      const periode = `${annee}-${mois}`;
      
      const nomMois = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      periodes.push({
        valeur: periode,
        label: nomMois.charAt(0).toUpperCase() + nomMois.slice(1)
      });
    }
    
    return periodes;
  }

  /**
   * Formater le montant en FCFA
   */
  formaterMontant(montant) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  }

  /**
   * Calculer le pourcentage payé
   */
  calculerPourcentagePaye(montantPaye, montantDu) {
    if (montantDu === 0) return 0;
    return Math.round((montantPaye / montantDu) * 100);
  }

  /**
   * Obtenir le statut avec couleur
   */
  obtenirStatutAvecCouleur(statut) {
    const statuts = {
      'CALCULE': {
        label: 'Calculé',
        couleur: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      },
      'PARTIEL': {
        label: 'Payé partiellement',
        couleur: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      },
      'PAYE': {
        label: 'Payé intégralement',
        couleur: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      },
      'ANNULE': {
        label: 'Annulé',
        couleur: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      }
    };

    return statuts[statut] || statuts['CALCULE'];
  }

  /**
   * Obtenir le label du type de contrat
   */
  obtenirLabelTypeContrat(type) {
    const types = {
      'JOURNALIER': 'Journalier',
      'FIXE': 'Salaire Fixe',
      'HONORAIRE': 'Honoraire'
    };
    return types[type] || type;
  }

  /**
   * Obtenir le label de la méthode de paiement
   */
  obtenirLabelMethodePaiement(methode) {
    const methodes = {
      'ESPECES': 'Espèces',
      'VIREMENT_BANCAIRE': 'Virement Bancaire',
      'ORANGE_MONEY': 'Orange Money',
      'WAVE': 'Wave',
      'AUTRE': 'Autre'
    };
    return methodes[methode] || methode;
  }

  /**
   * Vérifier si l'utilisateur peut calculer les paiements (ADMIN et CAISSIER)
   */
  peutCalculerPaiements() {
    const utilisateur = authService.getCurrentUser();
    return utilisateur && (utilisateur.role === 'CAISSIER' || utilisateur.role === 'ADMIN');
  }

  /**
   * Vérifier si l'utilisateur peut valider les pointages (ADMIN uniquement)
   */
  peutValiderPointages() {
    const utilisateur = authService.getCurrentUser();
    return utilisateur && utilisateur.role === 'ADMIN';
  }

  /**
   * Obtenir le message d'erreur pour les pointages non validés
   */
  obtenirMessageErreurPointages(error) {
    if (error.type === 'POINTAGES_NON_VALIDES') {
      return {
        titre: '⚠️ Pointages non validés',
        message: error.message,
        type: 'warning',
        suggestion: 'Demandez à un ADMIN de valider les pointages de cette période avant de calculer le paiement.'
      };
    }
    return {
      titre: '❌ Erreur',
      message: error.response?.data?.message || error.message || 'Une erreur est survenue',
      type: 'error'
    };
  }

  /**
   * Formater les informations de traçabilité
   */
  formaterTracabilite(paiement) {
    const tracabilite = [];
    
    if (paiement.tracabilite?.calculeParCaissier) {
      tracabilite.push({
        action: 'Calculé par',
        utilisateur: paiement.tracabilite.calculeParCaissier,
        date: paiement.dateCalcul,
        icone: '🧮'
      });
    }
    
    if (paiement.tracabilite?.payeParCaissier) {
      tracabilite.push({
        action: 'Payé par',
        utilisateur: paiement.tracabilite.payeParCaissier,
        date: paiement.datePaiement,
        icone: '💰'
      });
    }
    
    return tracabilite;
  }

  /**
   * Obtenir l'icône et la couleur pour le statut de validation des pointages
   */
  obtenirStatutValidationPointages(validationInfo) {
    if (validationInfo.estValide) {
      return {
        icone: '✅',
        couleur: 'green',
        message: `Pointages validés par ${validationInfo.adminValidateur}`,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      };
    } else {
      return {
        icone: '⚠️',
        couleur: 'yellow',
        message: `${validationInfo.pointagesNonValides} pointage(s) à valider`,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      };
    }
  }
}

export default new PaiementAutomatiseService();