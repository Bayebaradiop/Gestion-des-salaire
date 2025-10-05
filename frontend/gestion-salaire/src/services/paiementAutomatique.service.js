import authService from './auth.service';

class PaiementAutomatiqueService {
  
  /**
   * Obtient un aperçu des calculs de salaires basés sur les pointages
   */
  async obtenirApercuCalculs(entrepriseId, dateDebut, dateFin) {
    try {
      const response = await authService.axios.post(
        `/entreprises/${entrepriseId}/paiements-automatiques/apercu`,
        { dateDebut, dateFin }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur aperçu calculs automatiques:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Génère automatiquement les bulletins de paie basés sur les pointages
   */
  async genererBulletinsAutomatiques(entrepriseId, cyclePaieId, dateDebut, dateFin) {
    try {
      const response = await authService.axios.post(
        `/entreprises/${entrepriseId}/paiements-automatiques/generer`,
        { cyclePaieId, dateDebut, dateFin }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur génération bulletins automatiques:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Valide les pointages avant le calcul automatique
   */
  async validerPointages(entrepriseId, dateDebut, dateFin) {
    try {
      const response = await authService.axios.post(
        `/entreprises/${entrepriseId}/paiements-automatiques/validation`,
        { dateDebut, dateFin }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur validation pointages:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Formate un montant en devise locale
   */
  formatMontant(montant) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * Formate une période
   */
  formatPeriode(dateDebut, dateFin) {
    const debut = new Date(dateDebut).toLocaleDateString('fr-FR');
    const fin = new Date(dateFin).toLocaleDateString('fr-FR');
    return `${debut} - ${fin}`;
  }

  /**
   * Calcule le nombre de jours ouvrés entre deux dates
   */
  calculerJoursOuvres(dateDebut, dateFin) {
    let count = 0;
    const current = new Date(dateDebut);
    const end = new Date(dateFin);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Exclure samedi (6) et dimanche (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Obtient le libellé d'un type de contrat
   */
  getTypeContratLabel(type) {
    const types = {
      'FIXE': 'Salaire fixe',
      'JOURNALIER': 'Journalier',
      'HORAIRE': 'Horaire',
      'HONORAIRE': 'Honoraire'
    };
    return types[type] || type;
  }

  /**
   * Obtient la couleur associée à un type de contrat
   */
  getTypeContratColor(type) {
    const colors = {
      'FIXE': 'blue',
      'JOURNALIER': 'green', 
      'HORAIRE': 'orange',
      'HONORAIRE': 'purple'
    };
    return colors[type] || 'gray';
  }

  /**
   * Valide une période de dates
   */
  validerPeriode(dateDebut, dateFin) {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const maintenant = new Date();

    const erreurs = [];

    if (debut >= fin) {
      erreurs.push('La date de début doit être antérieure à la date de fin');
    }

    if (fin > maintenant) {
      erreurs.push('La date de fin ne peut pas être dans le futur');
    }

    const diffJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
    if (diffJours > 31) {
      erreurs.push('La période ne peut pas dépasser 31 jours');
    }

    return {
      valide: erreurs.length === 0,
      erreurs
    };
  }

  /**
   * Génère un résumé des calculs pour l'affichage
   */
  genererResumeCalculs(calculs) {
    if (!calculs || calculs.length === 0) {
      return {
        totalEmployes: 0,
        totalSalaireBrut: 0,
        totalSalaireNet: 0,
        totalEconomies: 0,
        typeContrats: {}
      };
    }

    const resume = calculs.reduce((acc, calcul) => {
      acc.totalEmployes += 1;
      acc.totalSalaireBrut += calcul.salaireBrut;
      acc.totalSalaireNet += calcul.salaireNet;
      
      // Compter par type de contrat
      if (!acc.typeContrats[calcul.typeContrat]) {
        acc.typeContrats[calcul.typeContrat] = {
          count: 0,
          totalBrut: 0,
          totalNet: 0
        };
      }
      acc.typeContrats[calcul.typeContrat].count += 1;
      acc.typeContrats[calcul.typeContrat].totalBrut += calcul.salaireBrut;
      acc.typeContrats[calcul.typeContrat].totalNet += calcul.salaireNet;
      
      return acc;
    }, {
      totalEmployes: 0,
      totalSalaireBrut: 0,
      totalSalaireNet: 0,
      typeContrats: {}
    });

    resume.totalEconomies = resume.totalSalaireBrut - resume.totalSalaireNet;

    return resume;
  }

  /**
   * Gestion des erreurs API
   */
  handleApiError(error) {
    if (error.response) {
      // Erreur de réponse du serveur
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.error || 'Données invalides');
        case 401:
          return new Error('Session expirée, veuillez vous reconnecter');
        case 403:
          return new Error('Accès non autorisé');
        case 404:
          return new Error('Ressource non trouvée');
        case 500:
          return new Error(data.message || 'Erreur du serveur');
        default:
          return new Error(`Erreur ${status}: ${data.error || 'Erreur inconnue'}`);
      }
    } else if (error.request) {
      // Pas de réponse du serveur
      return new Error('Impossible de contacter le serveur');
    } else {
      // Erreur de configuration
      return new Error(error.message || 'Erreur de requête');
    }
  }
}

export default new PaiementAutomatiqueService();