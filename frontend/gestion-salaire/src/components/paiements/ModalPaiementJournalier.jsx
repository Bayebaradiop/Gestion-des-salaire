import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import paiementJournalierService from '../../services/paiementJournalier.service';

/**
 * Modal pour enregistrer un paiement journalier
 */
const ModalPaiementJournalier = ({ employe, periode, onClose, onPaiementEnregistre }) => {
  const [formData, setFormData] = useState({
    montantPaye: '',
    methodePaiement: 'ESPECES',
    reference: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [detailCalcul, setDetailCalcul] = useState(null);

  useEffect(() => {
    if (employe) {
      // Pré-remplir avec le reste à payer
      setFormData(prev => ({
        ...prev,
        montantPaye: employe.resteAPayer?.toString() || '0'
      }));
      
      // Charger le détail complet si nécessaire
      chargerDetailCalcul();
    }
  }, [employe]);

  const chargerDetailCalcul = async () => {
    try {
      const response = await paiementJournalierService.obtenirDetailCalcul(
        employe.employeId,
        periode.mois,
        periode.annee
      );
      
      if (response.success) {
        setDetailCalcul(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement détail:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const donnees = {
      employeId: employe.employeId,
      mois: periode.mois,
      annee: periode.annee,
      montantPaye: parseFloat(formData.montantPaye),
      methodePaiement: formData.methodePaiement,
      reference: formData.reference || undefined,
      notes: formData.notes || undefined
    };

    // Validation
    const erreurs = paiementJournalierService.validerDonneesPaiement(donnees);
    if (erreurs.length > 0) {
      toast.error(erreurs.join(', '));
      return;
    }

    if (donnees.montantPaye > employe.resteAPayer) {
      toast.error(`Le montant ne peut pas dépasser le reste à payer (${paiementJournalierService.formaterMontant(employe.resteAPayer)})`);
      return;
    }

    try {
      setLoading(true);
      const response = await paiementJournalierService.enregistrerPaiement(donnees);
      
      if (response.success) {
        toast.success('Paiement enregistré avec succès !');
        onPaiementEnregistre(response.data);
      } else {
        toast.error(response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur enregistrement paiement:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculerPourcentage = () => {
    const montant = parseFloat(formData.montantPaye) || 0;
    if (employe.salaireNet === 0) return 0;
    return ((employe.totalDejaPaye + montant) / employe.salaireNet * 100).toFixed(1);
  };

  if (!employe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              💰 Nouveau Paiement Journalier
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Informations employé */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="font-semibold text-blue-800">
                {employe.prenom?.[0]}{employe.nom?.[0]}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {employe.prenom} {employe.nom}
              </div>
              <div className="text-sm text-gray-600">
                {employe.codeEmploye} • {paiementJournalierService.obtenirLabelTypeContrat(employe.typeContrat)}
              </div>
              <div className="text-sm text-gray-600">
                Période: {periode.mois}/{periode.annee}
              </div>
            </div>
          </div>
        </div>

        {/* Résumé du calcul */}
        <div className="px-6 py-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">📊 Résumé du calcul</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Jours pointés:</span>
                <span className="font-medium">{employe.joursPointes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heures normales:</span>
                <span className="font-medium">{((employe.heuresPointes || 0) - (employe.heuresSupplementaires || 0)).toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heures supplémentaires:</span>
                <span className="font-medium text-orange-600">{(employe.heuresSupplementaires || 0).toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taux journalier:</span>
                <span className="font-medium">{paiementJournalierService.formaterMontant(employe.tauxJournalier)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Salaire brut:</span>
                <span className="font-medium">{paiementJournalierService.formaterMontant(employe.salaireBrutTotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Déductions:</span>
                <span className="font-medium text-red-600">-{paiementJournalierService.formaterMontant(employe.deductions || 0)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span className="text-gray-900">Salaire net:</span>
                <span className="text-green-600">{paiementJournalierService.formaterMontant(employe.salaireNet || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Déjà payé:</span>
                <span className="font-medium">{paiementJournalierService.formaterMontant(employe.totalDejaPaye || 0)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span className="text-gray-900">Reste à payer:</span>
                <span className="text-red-600">{paiementJournalierService.formaterMontant(employe.resteAPayer || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">💳 Informations de paiement</h4>
          
          <div className="space-y-4">
            {/* Montant à payer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant à payer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="montantPaye"
                  value={formData.montantPaye}
                  onChange={handleChange}
                  min="0"
                  max={employe.resteAPayer}
                  step="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">XOF</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Maximum: {paiementJournalierService.formaterMontant(employe.resteAPayer)} 
                • Couverture: {calculerPourcentage()}% du salaire net
              </div>
            </div>

            {/* Méthode de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode de paiement <span className="text-red-500">*</span>
              </label>
              <select
                name="methodePaiement"
                value={formData.methodePaiement}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ESPECES">💵 Espèces</option>
                <option value="VIREMENT_BANCAIRE">🏦 Virement bancaire</option>
                <option value="ORANGE_MONEY">📱 Orange Money</option>
                <option value="WAVE">〰️ Wave</option>
                <option value="AUTRE">❓ Autre</option>
              </select>
            </div>

            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence (optionnel)
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Chèque #123, Transaction #ABC..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.montantPaye || parseFloat(formData.montantPaye) <= 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Enregistrement...
                </>
              ) : (
                <>
                  💰 Enregistrer le paiement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPaiementJournalier;