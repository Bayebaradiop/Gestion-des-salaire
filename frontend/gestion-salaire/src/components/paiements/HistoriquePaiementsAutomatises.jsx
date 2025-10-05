import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import paiementAutomatiseService from '../../services/paiementAutomatise.service';
import authService from '../../services/auth.service';

/**
 * Composant pour afficher l'historique des paiements automatisés avec traçabilité
 */
const HistoriquePaiementsAutomatises = ({ entrepriseId }) => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodeFiltre, setPeriodeFiltre] = useState('');
  const [paiementSelectionne, setPaiementSelectionne] = useState(null);
  const [modalMarquerPaye, setModalMarquerPaye] = useState(false);

  const utilisateur = authService.getCurrentUser();
  const estCaissier = paiementAutomatiseService.peutCalculerPaiements();

  useEffect(() => {
    chargerPaiements();
  }, [entrepriseId, periodeFiltre]);

  const chargerPaiements = async () => {
    try {
      setLoading(true);
      const response = await paiementAutomatiseService.obtenirPaiementsEntreprise(
        entrepriseId,
        periodeFiltre || null
      );
      setPaiements(response.paiements || []);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModalPaiement = (paiement) => {
    if (!estCaissier) {
      toast.error('Seuls les CAISSIER peuvent marquer les paiements comme payés');
      return;
    }
    setPaiementSelectionne(paiement);
    setModalMarquerPaye(true);
  };

  const marquerCommePaye = async (montant, methode, notes) => {
    try {
      await paiementAutomatiseService.marquerCommePaye(
        paiementSelectionne.id,
        montant,
        methode,
        notes
      );
      
      toast.success('Paiement marqué comme payé avec succès');
      setModalMarquerPaye(false);
      setPaiementSelectionne(null);
      
      // Recharger les paiements
      await chargerPaiements();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du paiement');
    }
  };

  const periodes = paiementAutomatiseService.genererListePeriodes(12);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            📊 Historique des Paiements Automatisés
          </h2>
          <div className="flex items-center space-x-3">
            <select
              value={periodeFiltre}
              onChange={(e) => setPeriodeFiltre(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les périodes</option>
              {periodes.map(p => (
                <option key={p.valeur} value={p.valeur}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              onClick={chargerPaiements}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Paiements</div>
            <div className="text-2xl font-bold text-blue-900">{paiements.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Payés Intégralement</div>
            <div className="text-2xl font-bold text-green-900">
              {paiements.filter(p => p.statut === 'PAYE').length}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Payés Partiellement</div>
            <div className="text-2xl font-bold text-yellow-900">
              {paiements.filter(p => p.statut === 'PARTIEL').length}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">En Attente</div>
            <div className="text-2xl font-bold text-gray-900">
              {paiements.filter(p => p.statut === 'CALCULE').length}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {paiements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p>Aucun paiement automatisé trouvé</p>
            {periodeFiltre && (
              <p className="text-sm mt-2">pour la période {periodeFiltre}</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Contrat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant Dû
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant Payé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Traçabilité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paiements.map((paiement) => {
                  const statutInfo = paiementAutomatiseService.obtenirStatutAvecCouleur(paiement.statut);
                  const tracabilite = paiementAutomatiseService.formaterTracabilite(paiement);
                  const pourcentagePaye = paiementAutomatiseService.calculerPourcentagePaye(
                    paiement.montantPaye, 
                    paiement.montantDu
                  );

                  return (
                    <tr key={paiement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {paiement.employe.prenom} {paiement.employe.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {paiement.employe.poste}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paiement.periode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paiementAutomatiseService.obtenirLabelTypeContrat(paiement.typeContrat)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {paiementAutomatiseService.formaterMontant(paiement.montantDu)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {paiementAutomatiseService.formaterMontant(paiement.montantPaye)}
                        </div>
                        {pourcentagePaye > 0 && (
                          <div className="text-xs text-gray-500">
                            {pourcentagePaye}% payé
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutInfo.bgColor} ${statutInfo.textColor}`}>
                          {statutInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {tracabilite.map((trace, index) => (
                          <div key={index} className="flex items-center mb-1">
                            <span className="mr-1">{trace.icone}</span>
                            <span>{trace.action}: {trace.utilisateur}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {estCaissier && paiement.statut !== 'PAYE' && (
                          <button
                            onClick={() => ouvrirModalPaiement(paiement)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            💰 Payer
                          </button>
                        )}
                        <button
                          onClick={() => setPaiementSelectionne(paiement)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          👁️ Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de marquage comme payé */}
      {modalMarquerPaye && paiementSelectionne && (
        <ModalMarquerPaye
          paiement={paiementSelectionne}
          onPayer={marquerCommePaye}
          onFermer={() => {
            setModalMarquerPaye(false);
            setPaiementSelectionne(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * Modal pour marquer un paiement comme payé
 */
const ModalMarquerPaye = ({ paiement, onPayer, onFermer }) => {
  const [montant, setMontant] = useState(paiement.montantDu - paiement.montantPaye);
  const [methode, setMethode] = useState('ESPECES');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const montantRestant = paiement.montantDu - paiement.montantPaye;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (montant <= 0 || montant > montantRestant) {
      toast.error('Montant invalide');
      return;
    }

    try {
      setLoading(true);
      await onPayer(montant, methode, notes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              💰 Marquer comme payé
            </h3>
            <button
              onClick={onFermer}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>{paiement.employe.prenom} {paiement.employe.nom}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Période: {paiement.periode} • 
              Montant restant: {paiementAutomatiseService.formaterMontant(montantRestant)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant à payer
              </label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                max={montantRestant}
                min={0}
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode de paiement
              </label>
              <select
                value={methode}
                onChange={(e) => setMethode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ESPECES">Espèces</option>
                <option value="VIREMENT_BANCAIRE">Virement Bancaire</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="WAVE">Wave</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notes sur le paiement..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onFermer}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : '💰 Payer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HistoriquePaiementsAutomatises;