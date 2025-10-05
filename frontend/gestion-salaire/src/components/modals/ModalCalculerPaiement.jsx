import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, Clock, DollarSign, FileText, AlertCircle } from 'lucide-react';
import paiementAutomatiseService from '../../services/paiementAutomatise.service';

const ModalCalculerPaiement = ({ 
  isOpen, 
  onClose, 
  employe,
  onPaiementCalcule 
}) => {
  const [periode, setPeriode] = useState(paiementAutomatiseService.genererPeriodeActuelle());
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [error, setError] = useState('');

  // Liste des périodes disponibles
  const periodes = paiementAutomatiseService.genererListePeriodes(6);

  const handleCalculer = async () => {
    if (!employe?.id || !periode) return;

    setLoading(true);
    setError('');
    setResultat(null);

    try {
      const response = await paiementAutomatiseService.calculerPaiement(employe.id, periode);
      setResultat(response);
    } catch (err) {
      console.error('Erreur calcul:', err);
      setError(err.response?.data?.message || 'Erreur lors du calcul du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrer = async () => {
    if (!employe?.id || !periode) return;

    setLoading(true);
    setError('');

    try {
      const response = await paiementAutomatiseService.enregistrerPaiement(employe.id, periode);
      
      // Notifier le parent
      if (onPaiementCalcule) {
        onPaiementCalcule(response.paiement);
      }

      // Fermer le modal
      onClose();
      
      // Réinitialiser
      setResultat(null);
      setPeriode(paiementAutomatiseService.genererPeriodeActuelle());
      
    } catch (err) {
      console.error('Erreur enregistrement:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement');
    } finally {
      setLoading(false);
    }
  };

  const renderDetailsCalcul = () => {
    if (!resultat?.detailsCalcul) return null;

    const details = resultat.detailsCalcul;

    switch (details.type) {
      case 'JOURNALIER':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Détails du calcul - Contrat Journalier</h4>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Taux journalier:</span>
                <span className="font-medium">{paiementAutomatiseService.formaterMontant(details.tauxJournalier)}</span>
              </div>
              <div className="flex justify-between">
                <span>Jours travaillés:</span>
                <span className="font-medium text-green-600">{details.joursTravailes} jours</span>
              </div>
              <div className="flex justify-between">
                <span>Jours d'absence:</span>
                <span className="font-medium text-red-600">{details.joursAbsents} jours</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Montant total:</span>
                <span className="text-blue-700">{paiementAutomatiseService.formaterMontant(details.montantBrut)}</span>
              </div>
            </div>
          </div>
        );

      case 'HONORAIRE':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Détails du calcul - Contrat Honoraire</h4>
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Taux horaire:</span>
                <span className="font-medium">{paiementAutomatiseService.formaterMontant(details.tauxHoraire)}</span>
              </div>
              <div className="flex justify-between">
                <span>Heures travaillées:</span>
                <span className="font-medium text-green-600">{details.heuresTravailes}h</span>
              </div>
              <hr className="border-green-200" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Montant total:</span>
                <span className="text-green-700">{paiementAutomatiseService.formaterMontant(details.montantBrut)}</span>
              </div>
            </div>
          </div>
        );

      case 'FIXE':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Détails du calcul - Salaire Fixe</h4>
            <div className="bg-purple-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Salaire fixe mensuel:</span>
                <span className="font-medium">{paiementAutomatiseService.formaterMontant(details.salaireFixe)}</span>
              </div>
              <div className="flex justify-between">
                <span>Jours ouvrables:</span>
                <span className="font-medium">{details.joursOuvrables} jours</span>
              </div>
              <div className="flex justify-between">
                <span>Jours d'absence:</span>
                <span className="font-medium text-red-600">{details.joursAbsents} jours</span>
              </div>
              <div className="flex justify-between">
                <span>Déduction absences:</span>
                <span className="font-medium text-red-600">-{paiementAutomatiseService.formaterMontant(details.deductionAbsences)}</span>
              </div>
              <hr className="border-purple-200" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Montant net:</span>
                <span className="text-purple-700">{paiementAutomatiseService.formaterMontant(details.montantNet)}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Calculer Paiement
                </h2>
                <p className="text-sm text-gray-500">
                  {employe?.prenom} {employe?.nom} - {employe?.poste}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Sélection de période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Période de calcul
              </label>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {periodes.map((p) => (
                  <option key={p.valeur} value={p.valeur}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de contrat info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Type de contrat: {paiementAutomatiseService.obtenirLabelTypeContrat(employe?.typeContrat)}
              </h3>
              <p className="text-sm text-gray-600">
                {employe?.typeContrat === 'JOURNALIER' && 'Le calcul sera basé sur le nombre de jours travaillés selon les pointages.'}
                {employe?.typeContrat === 'HONORAIRE' && 'Le calcul sera basé sur le nombre d\'heures travaillées selon les pointages.'}
                {employe?.typeContrat === 'FIXE' && 'Le calcul sera basé sur le salaire fixe avec déduction des absences.'}
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Erreur</h4>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Résultat */}
            {resultat && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-800">
                      <DollarSign className="inline w-5 h-5 mr-1" />
                      Montant calculé
                    </h3>
                    <span className="text-2xl font-bold text-green-700">
                      {paiementAutomatiseService.formaterMontant(resultat.montantDu)}
                    </span>
                  </div>
                </div>

                {renderDetailsCalcul()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            
            {!resultat && (
              <button
                onClick={handleCalculer}
                disabled={loading || !periode}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Calculator className="w-4 h-4" />
                <span>{loading ? 'Calcul...' : 'Calculer'}</span>
              </button>
            )}

            {resultat && (
              <button
                onClick={handleEnregistrer}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>{loading ? 'Enregistrement...' : 'Enregistrer le paiement'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalCalculerPaiement;