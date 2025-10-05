import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Clock, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import paiementAutomatiqueService from '../../services/paiementAutomatique.service';
import pointageService from '../../services/pointage.service';

/**
 * Composant qui affiche des informations sur le calcul automatique du salaire
 * basé sur les pointages de l'employé
 */
const InfoCalculAutomatique = ({ employe, bulletinSelectionne }) => {
  const [infoPointages, setInfoPointages] = useState(null);
  const [calculAutomatique, setCalculAutomatique] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employe && bulletinSelectionne) {
      chargerInfoPointages();
    }
  }, [employe, bulletinSelectionne]);

  const chargerInfoPointages = async () => {
    setLoading(true);
    try {
      // Récupérer la période du cycle de paie
      const cycle = bulletinSelectionne.cyclePaie;
      const dateDebut = new Date(cycle.dateDebut).toISOString().split('T')[0];
      const dateFin = new Date(cycle.dateFin).toISOString().split('T')[0];

      // Récupérer les pointages de l'employé pour cette période
      const response = await pointageService.lister(employe.entrepriseId, {
        du: dateDebut,
        au: dateFin,
        employeId: employe.id
      });
      const pointages = response.data || response;

      // Calculer les statistiques
      const stats = calculerStatistiquesPointages(pointages, dateDebut, dateFin);
      setInfoPointages(stats);

      // Calculer ce que serait le salaire avec le système automatique
      const calculAuto = calculerSalaireAutomatique(employe, pointages, dateDebut, dateFin);
      setCalculAutomatique(calculAuto);

    } catch (error) {
      console.error('Erreur chargement info pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculerStatistiquesPointages = (pointages, dateDebut, dateFin) => {
    const joursOuvres = paiementAutomatiqueService.calculerJoursOuvres(dateDebut, dateFin);
    const joursPresents = pointages.filter(p => p.statut === 'PRESENT' || p.statut === 'RETARD').length;
    const joursAbsents = pointages.filter(p => p.statut === 'ABSENT').length;
    const retards = pointages.filter(p => p.statut === 'RETARD').length;
    
    const heuresTravaileesTotales = pointages.reduce((total, p) => {
      return total + (p.dureeMinutes ? p.dureeMinutes / 60 : 0);
    }, 0);

    const heuresMoyennesParJour = joursPresents > 0 ? heuresTravaileesTotales / joursPresents : 0;

    return {
      joursOuvres,
      joursPresents,
      joursAbsents,
      retards,
      heuresTravaileesTotales: Math.round(heuresTravaileesTotales * 100) / 100,
      heuresMoyennesParJour: Math.round(heuresMoyennesParJour * 100) / 100,
      tauxPresence: Math.round((joursPresents / joursOuvres) * 100)
    };
  };

  const calculerSalaireAutomatique = (employe, pointages, dateDebut, dateFin) => {
    const joursOuvres = paiementAutomatiqueService.calculerJoursOuvres(dateDebut, dateFin);
    const joursPresents = pointages.filter(p => p.statut === 'PRESENT' || p.statut === 'RETARD').length;
    const joursAbsents = pointages.filter(p => p.statut === 'ABSENT').length;
    
    const heuresTravaileesTotales = pointages.reduce((total, p) => {
      return total + (p.dureeMinutes ? p.dureeMinutes / 60 : 0);
    }, 0);

    let salaireCalcule = 0;
    let methodeCalcul = '';
    let details = {};

    switch (employe.typeContrat) {
      case 'FIXE':
        const tauxAbsence = joursAbsents / joursOuvres;
        const deductionAbsence = (employe.salaireBase || 0) * tauxAbsence;
        salaireCalcule = (employe.salaireBase || 0) - deductionAbsence;
        methodeCalcul = 'Salaire fixe moins déductions pour absences';
        details = {
          salaireBase: employe.salaireBase || 0,
          deductionAbsence: Math.round(deductionAbsence * 100) / 100,
          tauxAbsence: Math.round(tauxAbsence * 100)
        };
        break;

      case 'JOURNALIER':
        salaireCalcule = (employe.tauxJournalier || 0) * joursPresents;
        methodeCalcul = 'Taux journalier × jours travaillés';
        details = {
          tauxJournalier: employe.tauxJournalier || 0,
          joursTravailes: joursPresents
        };
        break;

      case 'HORAIRE':
        const tauxHoraire = employe.tauxHoraire || (employe.salaireBase ? employe.salaireBase / (22 * 8) : 0);
        salaireCalcule = tauxHoraire * heuresTravaileesTotales;
        methodeCalcul = 'Taux horaire × heures travaillées';
        details = {
          tauxHoraire: Math.round(tauxHoraire * 100) / 100,
          heuresTravaileesTotales: Math.round(heuresTravaileesTotales * 100) / 100
        };
        break;

      case 'HONORAIRE':
        salaireCalcule = employe.salaireBase || 0;
        methodeCalcul = 'Honoraire fixe';
        details = {
          honoraire: employe.salaireBase || 0
        };
        break;

      default:
        salaireCalcule = employe.salaireBase || 0;
        methodeCalcul = 'Salaire de base';
    }

    return {
      montant: Math.round(salaireCalcule * 100) / 100,
      methodeCalcul,
      details
    };
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(montant);
  };

  const getTypeContratColor = (type) => {
    const colors = {
      'FIXE': 'blue',
      'JOURNALIER': 'green',
      'HORAIRE': 'orange',
      'HONORAIRE': 'purple'
    };
    return colors[type] || 'gray';
  };

  const getTypeContratLabel = (type) => {
    const labels = {
      'FIXE': 'Salaire fixe',
      'JOURNALIER': 'Journalier',
      'HORAIRE': 'Horaire',
      'HONORAIRE': 'Honoraire'
    };
    return labels[type] || type;
  };

  if (!employe || !bulletinSelectionne) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-indigo-600" />
        <h4 className="font-medium text-indigo-900">Informations Calcul Automatique</h4>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-indigo-600 mt-2">Chargement des données de pointage...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Type de contrat */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getTypeContratColor(employe.typeContrat)}-100 text-${getTypeContratColor(employe.typeContrat)}-800`}>
              {getTypeContratLabel(employe.typeContrat)}
            </span>
          </div>

          {/* Statistiques de pointage */}
          {infoPointages && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-white rounded-md border">
                <div className="text-lg font-bold text-gray-900">{infoPointages.joursPresents}</div>
                <div className="text-xs text-gray-600">Jours présents</div>
              </div>
              <div className="text-center p-2 bg-white rounded-md border">
                <div className="text-lg font-bold text-red-600">{infoPointages.joursAbsents}</div>
                <div className="text-xs text-gray-600">Jours absents</div>
              </div>
              <div className="text-center p-2 bg-white rounded-md border">
                <div className="text-lg font-bold text-orange-600">{infoPointages.retards}</div>
                <div className="text-xs text-gray-600">Retards</div>
              </div>
              <div className="text-center p-2 bg-white rounded-md border">
                <div className="text-lg font-bold text-blue-600">{infoPointages.tauxPresence}%</div>
                <div className="text-xs text-gray-600">Taux présence</div>
              </div>
            </div>
          )}

          {/* Calcul automatique */}
          {calculAutomatique && (
            <div className="bg-white rounded-md p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">Calcul automatique basé sur les pointages</span>
              </div>
              
              <div className="text-xl font-bold text-green-600 mb-2">
                {formatMontant(calculAutomatique.montant)}
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <strong>Méthode:</strong> {calculAutomatique.methodeCalcul}
              </div>

              {/* Détails du calcul */}
              <div className="text-xs text-gray-500 space-y-1">
                {employe.typeContrat === 'FIXE' && calculAutomatique.details && (
                  <>
                    <div>Base: {formatMontant(calculAutomatique.details.salaireBase)}</div>
                    {calculAutomatique.details.deductionAbsence > 0 && (
                      <div>Déduction absences ({calculAutomatique.details.tauxAbsence}%): -{formatMontant(calculAutomatique.details.deductionAbsence)}</div>
                    )}
                  </>
                )}
                
                {employe.typeContrat === 'JOURNALIER' && calculAutomatique.details && (
                  <>
                    <div>Taux journalier: {formatMontant(calculAutomatique.details.tauxJournalier)}</div>
                    <div>Jours travaillés: {calculAutomatique.details.joursTravailes}</div>
                  </>
                )}
                
                {employe.typeContrat === 'HORAIRE' && calculAutomatique.details && (
                  <>
                    <div>Taux horaire: {formatMontant(calculAutomatique.details.tauxHoraire)}</div>
                    <div>Heures travaillées: {calculAutomatique.details.heuresTravaileesTotales}h</div>
                  </>
                )}
              </div>

              {/* Comparaison avec le bulletin */}
              {Math.abs(calculAutomatique.montant - bulletinSelectionne.salaireNet) > 1 && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Différence détectée</span>
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    Le calcul automatique ({formatMontant(calculAutomatique.montant)}) diffère du bulletin 
                    ({formatMontant(bulletinSelectionne.salaireNet)})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conseil */}
          <div className="flex items-start gap-2 text-sm text-indigo-700">
            <Info className="w-4 h-4 mt-0.5" />
            <div>
              <strong>Conseil:</strong> Pour automatiser complètement les paiements, utilisez la fonction 
              "Paiement Automatique" qui calcule tous les salaires basés sur les pointages.
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InfoCalculAutomatique;