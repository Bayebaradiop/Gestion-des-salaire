import { useState, useCallback } from 'react';
import pointageService from '../services/pointage.service';

const HORAIRES_STANDARD = {
  debut: "08:00",
  fin: "17:00",
  toleranceRetard: 15, 
  heureAbsence: "12:13", 
  heureMarquageAbsence: "12:00" 
};

/**
 * Hook personnalisé pour gérer la logique des pointages
 * @param {number} entrepriseId - ID de l'entreprise
 * @returns {Object} Fonctions et états pour les pointages
 */
export function usePointage(entrepriseId) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const calculerRetard = useCallback((heureArrivee) => {
    if (!heureArrivee) return 0;

    const [hDebut, mDebut] = HORAIRES_STANDARD.debut.split(':').map(Number);
    const [hArrivee, mArrivee] = heureArrivee.split(':').map(Number);

    const debut = new Date();
    debut.setHours(hDebut, mDebut, 0, 0);

    const arrivee = new Date();
    arrivee.setHours(hArrivee, mArrivee, 0, 0);

    const diffMinutes = (arrivee - debut) / 60000;
    return Math.max(0, diffMinutes - HORAIRES_STANDARD.toleranceRetard);
  }, []);

  /**
   * Détermine le statut du pointage
   * @param {string} heureArrivee - Format "HH:MM"
   * @param {string} heureDepart - Format "HH:MM" 
   * @returns {string} PRESENT, RETARD, ABSENT, HEURES_SUP
   */
  const determinerStatut = useCallback((heureArrivee, heureDepart) => {
    const maintenant = new Date();
    const heureCourante = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}`;

    // Si pas d'arrivée et après l'heure d'absence
    if (!heureArrivee && heureCourante > HORAIRES_STANDARD.heureAbsence) {
      return 'ABSENT';
    }

    // Si arrivée en retard
    if (heureArrivee && calculerRetard(heureArrivee) > 0) {
      return 'RETARD';
    }

    // Si départ après l'heure normale
    if (heureDepart && heureDepart > HORAIRES_STANDARD.fin) {
      return 'HEURES_SUP';
    }

    // Présent normal
    return 'PRESENT';
  }, [calculerRetard]);


  const calculerHeuresSup = useCallback((heureDepart) => {
    if (!heureDepart) return 0;

    const [hFin, mFin] = HORAIRES_STANDARD.fin.split(':').map(Number);
    const [hDepart, mDepart] = heureDepart.split(':').map(Number);

    const fin = new Date();
    fin.setHours(hFin, mFin, 0, 0);

    const depart = new Date();
    depart.setHours(hDepart, mDepart, 0, 0);

    const diffMinutes = (depart - fin) / 60000;
    return Math.max(0, diffMinutes);
  }, []);


  const enregistrerArrivee = useCallback(async (employeId, notes = '') => {
    if (!employeId || !entrepriseId) return;

    setLoading(true);
    setMessage('');
    setError(null);

    try {
      const maintenant = new Date();
      const heureArrivee = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}`;
      
      const retardMinutes = calculerRetard(heureArrivee);
      const statut = determinerStatut(heureArrivee, null);

      // Ajouter info retard dans les notes si nécessaire
      let notesFinales = notes;
      if (retardMinutes > 0) {
        notesFinales = `${notes ? notes + ' | ' : ''}Retard: ${retardMinutes}min`.trim();
      }

      const response = await pointageService.arriver({
        entrepriseId,
        employeId: Number(employeId),
        notes: notesFinales
      });

      // Message personnalisé selon le statut
      if (retardMinutes > 0) {
        setMessage(`⚠️ Arrivée enregistrée avec ${retardMinutes} minutes de retard`);
      } else {
        setMessage('✅ Arrivée enregistrée à l\'heure');
      }

      return { success: true, data: response, statut, retardMinutes };
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'arrivée';
      setMessage(`❌ ${errorMsg}`);
      setError(error);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [entrepriseId, calculerRetard, determinerStatut]);

  /**
   * Enregistrer le départ d'un employé
   * @param {number} employeId - ID de l'employé
   * @param {string} notes - Notes optionnelles
   */
  const enregistrerDepart = useCallback(async (employeId, notes = '') => {
    if (!employeId || !entrepriseId) return;

    setLoading(true);
    setMessage('');
    setError(null);

    try {
      const maintenant = new Date();
      const heureDepart = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}`;
      
      const heuresSupMinutes = calculerHeuresSup(heureDepart);
      const statut = determinerStatut(null, heureDepart);

      // Ajouter info heures sup dans les notes si nécessaire
      let notesFinales = notes;
      if (heuresSupMinutes > 0) {
        const heures = Math.floor(heuresSupMinutes / 60);
        const minutes = heuresSupMinutes % 60;
        notesFinales = `${notes ? notes + ' | ' : ''}Heures sup: ${heures}h${minutes.toString().padStart(2, '0')}`.trim();
      }

      const response = await pointageService.depart({
        entrepriseId,
        employeId: Number(employeId),
        notes: notesFinales
      });

      // Message personnalisé selon le statut
      if (heuresSupMinutes > 0) {
        const heures = Math.floor(heuresSupMinutes / 60);
        const minutes = heuresSupMinutes % 60;
        setMessage(`🔵 Départ enregistré avec ${heures}h${minutes.toString().padStart(2, '0')} d'heures supplémentaires`);
      } else {
        setMessage('✅ Départ enregistré à l\'heure');
      }

      return { success: true, data: response, statut, heuresSupMinutes };
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Erreur lors de l\'enregistrement du départ';
      setMessage(`❌ ${errorMsg}`);
      setError(error);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [entrepriseId, calculerHeuresSup, determinerStatut]);

  /**
   * Vérifier les employés absents (à appeler périodiquement)
   * @param {Array} employes - Liste des employés
   * @param {Array} pointagesAujourdhui - Pointages du jour
   * @returns {Array} Liste des employés absents
   */
  const verifierAbsents = useCallback((employes, pointagesAujourdhui) => {
    const maintenant = new Date();
    const heureCourante = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}`;

    // Si avant l'heure d'absence, pas d'absents encore
    if (heureCourante < HORAIRES_STANDARD.heureAbsence) {
      return [];
    }

    const employesPointes = pointagesAujourdhui.map(p => p.employeId);
    
    return employes
      .filter(emp => !employesPointes.includes(emp.id))
      .map(emp => ({
        ...emp,
        statut: 'ABSENT',
        message: `Absent depuis ${HORAIRES_STANDARD.heureAbsence}`
      }));
  }, []);

  /**
   * Obtenir les statistiques du jour
   * @param {Array} pointages - Pointages du jour
   * @returns {Object} Statistiques
   */
  const obtenirStatistiques = useCallback((pointages) => {
    const total = pointages.length;
    const presents = pointages.filter(p => p.statut === 'PRESENT').length;
    const retards = pointages.filter(p => p.statut === 'RETARD').length;
    const absents = pointages.filter(p => p.statut === 'ABSENT').length;
    const heuresSup = pointages.filter(p => p.statut === 'HEURES_SUP').length;

    return {
      total,
      presents,
      retards,
      absents,
      heuresSup,
      tauxPresence: total > 0 ? ((presents + retards) / total * 100).toFixed(1) : 0,
      retardMoyen: retards > 0 ? 
        (pointages
          .filter(p => p.statut === 'RETARD')
          .reduce((sum, p) => sum + (p.retardMinutes || 0), 0) / retards
        ).toFixed(0) : 0
    };
  }, []);

  /**
   * Marquer automatiquement les absences à 12h00
   * @param {Array} employes - Liste de tous les employés
   * @param {Array} pointagesAujourdhui - Pointages déjà enregistrés aujourd'hui
   * @returns {Promise<Object>} Résultat du marquage automatique
   */
  const marquerAbsencesAutomatiques = useCallback(async (employes, pointagesAujourdhui) => {
    if (!entrepriseId) return { success: false, error: 'Pas d\'entreprise' };

    const maintenant = new Date();
    const heureCourante = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}`;
    
    // Vérifier si c'est 12h00 pile (ou après)
    if (heureCourante < HORAIRES_STANDARD.heureMarquageAbsence) {
      return { 
        success: false, 
        error: `Marquage automatique prévu à ${HORAIRES_STANDARD.heureMarquageAbsence}`,
        heureActuelle: heureCourante 
      };
    }

    // Trouver les employés absents
    const employesPointes = pointagesAujourdhui.map(p => p.employeId);
    const employesAbsents = employes.filter(emp => !employesPointes.includes(emp.id));

    if (employesAbsents.length === 0) {
      return { 
        success: true, 
        message: 'Aucun employé absent à marquer',
        nombreMarques: 0 
      };
    }

    try {
      setLoading(true);
      
      // Marquer chaque employé absent
      const promisesAbsences = employesAbsents.map(async (employe) => {
        try {
          // Utiliser le service pour créer un pointage ABSENT
          const response = await pointageService.creerAbsence({
            entrepriseId,
            employeId: employe.id,
            date: maintenant.toISOString().split('T')[0], // YYYY-MM-DD
            statut: 'ABSENT',
            notes: `Marqué absent automatiquement à ${heureCourante}`,
            marqueAutomatiquement: true
          });
          
          return { 
            success: true, 
            employe: `${employe.prenom} ${employe.nom}`,
            employeId: employe.id 
          };
        } catch (error) {
          return { 
            success: false, 
            employe: `${employe.prenom} ${employe.nom}`,
            employeId: employe.id,
            error: error?.response?.data?.message || 'Erreur inconnue' 
          };
        }
      });

      const resultats = await Promise.all(promisesAbsences);
      const reussites = resultats.filter(r => r.success);
      const echecs = resultats.filter(r => !r.success);

      const message = `✅ ${reussites.length} employé(s) marqué(s) absent(s) automatiquement à ${heureCourante}`;
      
      if (echecs.length > 0) {
        const messageEchecs = `❌ ${echecs.length} erreur(s): ${echecs.map(e => e.employe).join(', ')}`;
        setMessage(`${message} | ${messageEchecs}`);
      } else {
        setMessage(message);
      }

      return {
        success: true,
        nombreMarques: reussites.length,
        nombreEchecs: echecs.length,
        reussites,
        echecs,
        heureMarquage: heureCourante
      };

    } catch (error) {
      const errorMsg = 'Erreur lors du marquage automatique des absences';
      setMessage(`❌ ${errorMsg}`);
      setError(error);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [entrepriseId]);

  // Nettoyer le message après 5 secondes
  useState(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return {
    // États
    message,
    loading,
    error,
    
    // Actions principales
    enregistrerArrivee,
    enregistrerDepart,
    marquerAbsencesAutomatiques,
    
    // Utilitaires
    calculerRetard,
    calculerHeuresSup,
    determinerStatut,
    verifierAbsents,
    obtenirStatistiques,
    
    // Configuration
    horairesStandard: HORAIRES_STANDARD
  };
}

export default usePointage;