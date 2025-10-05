import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import paiementAutomatiseService from '../../services/paiementAutomatise.service';
import authService from '../../services/auth.service';

/**
 * Composant pour calculer les paiements automatisés basés sur les pointages
 * Intègre la séparation des rôles Admin/Caissier
 */
const CalculerPaiementAutomatise = ({ employeId, employe, onPaiementCalcule }) => {
  const [loading, setLoading] = useState(false);
  const [periode, setPeriode] = useState(paiementAutomatiseService.genererPeriodeActuelle());
  const [validationPointages, setValidationPointages] = useState(null);
  const [checkingValidation, setCheckingValidation] = useState(false);
  
  const utilisateur = authService.getCurrentUser();
  const estCaissier = paiementAutomatiseService.peutCalculerPaiements();
  const estAdmin = paiementAutomatiseService.peutValiderPointages();

  // Vérifier automatiquement la validation des pointages quand la période change
  useEffect(() => {
    if (employeId && periode) {
      verifierValidationPointages();
    }
  }, [employeId, periode]);

  const verifierValidationPointages = async () => {
    try {
      setCheckingValidation(true);
      const response = await paiementAutomatiseService.verifierValidationPointages(employeId, periode);
      setValidationPointages(response);
    } catch (error) {
      console.error('Erreur vérification validation:', error);
    } finally {
      setCheckingValidation(false);
    }
  };

  const validerPointages = async () => {
    if (!estAdmin) {
      toast.error('Seuls les ADMIN peuvent valider les pointages');
      return;
    }

    try {
      setLoading(true);
      const response = await paiementAutomatiseService.validerPointagesPeriode(employeId, periode);
      toast.success(response.message || 'Pointages validés avec succès');
      
      // Recharger le statut de validation
      await verifierValidationPointages();
    } catch (error) {
      const erreurInfo = paiementAutomatiseService.obtenirMessageErreurPointages(error);
      toast.error(erreurInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const calculerPaiement = async () => {
    if (!estCaissier) {
      toast.error('Seuls les CAISSIER peuvent calculer les paiements');
      return;
    }

    if (!validationPointages?.estValide) {
      toast.error('Les pointages doivent être validés par un ADMIN avant le calcul');
      return;
    }

    try {
      setLoading(true);
      const response = await paiementAutomatiseService.calculerPaiement(employeId, periode);
      
      toast.success(`💰 Paiement calculé : ${paiementAutomatiseService.formaterMontant(response.montantDu)}`);
      
      if (onPaiementCalcule) {
        onPaiementCalcule(response);
      }
    } catch (error) {
      const erreurInfo = paiementAutomatiseService.obtenirMessageErreurPointages(error);
      
      if (erreurInfo.type === 'warning') {
        toast.error(erreurInfo.message, { duration: 6000 });
      } else {
        toast.error(erreurInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const periodes = paiementAutomatiseService.genererListePeriodes(6);
  const statutValidation = validationPointages ? paiementAutomatiseService.obtenirStatutValidationPointages(validationPointages) : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          💰 Calculer Paiement Automatisé
        </h3>
        {employe && (
          <div className="text-sm text-gray-600">
            {employe.prenom} {employe.nom} • {paiementAutomatiseService.obtenirLabelTypeContrat(employe.typeContrat)}
          </div>
        )}
      </div>

      {/* Sélection de la période */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Période de paie
        </label>
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {periodes.map(p => (
            <option key={p.valeur} value={p.valeur}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Statut de validation des pointages */}
      {validationPointages && (
        <div className={`mb-4 p-3 rounded-md ${statutValidation.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">{statutValidation.icone}</span>
              <div>
                <div className={`font-medium ${statutValidation.textColor}`}>
                  Statut des pointages
                </div>
                <div className={`text-sm ${statutValidation.textColor}`}>
                  {statutValidation.message}
                </div>
              </div>
            </div>
            
            {/* Bouton de validation pour les ADMIN */}
            {estAdmin && !validationPointages.estValide && (
              <button
                onClick={validerPointages}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Validation...' : '✅ Valider'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Informations de validation en cours */}
      {checkingValidation && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Vérification des pointages...</span>
          </div>
        </div>
      )}

      {/* Actions selon le rôle */}
      <div className="space-y-3">
        {estAdmin && (
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">👨‍💼</span>
              <span className="font-medium text-blue-900">Mode Administrateur</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Vous pouvez valider les pointages de cette période. Une fois validés, 
              le caissier pourra calculer et effectuer le paiement.
            </p>
            {!validationPointages?.estValide && (
              <button
                onClick={validerPointages}
                disabled={loading || !validationPointages}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Validation en cours...' : '✅ Valider les pointages'}
              </button>
            )}
          </div>
        )}

        {estCaissier && (
          <div className="p-3 bg-green-50 rounded-md">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">💰</span>
              <span className="font-medium text-green-900">Mode Caissier</span>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Vous pouvez calculer le paiement une fois que les pointages sont validés par un administrateur.
            </p>
            <button
              onClick={calculerPaiement}
              disabled={loading || !validationPointages?.estValide}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Calcul en cours...' : '💰 Calculer Paiement'}
            </button>
            
            {!validationPointages?.estValide && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                ⚠️ En attente de validation des pointages par un admin
              </p>
            )}
          </div>
        )}

        {!estAdmin && !estCaissier && (
          <div className="p-3 bg-gray-100 rounded-md text-center">
            <span className="text-gray-600">
              🚫 Vous n'avez pas les permissions nécessaires pour cette action
            </span>
          </div>
        )}
      </div>

      {/* Informations sur la logique de calcul */}
      {employe && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            📊 Logique de calcul - {paiementAutomatiseService.obtenirLabelTypeContrat(employe.typeContrat)}
          </h4>
          <div className="text-xs text-gray-600">
            {employe.typeContrat === 'FIXE' && (
              <p>💡 Salaire fixe - (salaire ÷ jours ouvrables × jours d'absence pointés)</p>
            )}
            {employe.typeContrat === 'JOURNALIER' && (
              <p>💡 Taux journalier × nombre de jours présents (selon pointages)</p>
            )}
            {employe.typeContrat === 'HONORAIRE' && (
              <p>💡 Taux horaire × heures travaillées (heures d'arrivée/départ pointées)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculerPaiementAutomatise;