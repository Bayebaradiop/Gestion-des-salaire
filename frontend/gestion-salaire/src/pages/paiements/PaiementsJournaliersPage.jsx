import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { paiementJournalierService } from '../../services/paiementJournalier.service';

/**
 * Page de gestion des paiements journaliers
 * Interface pour calculer et enregistrer les paiements des employés journaliers
 */
const PaiementsJournaliersPage = () => {
  const { user } = useAuth();
  
  // Permissions basées sur le rôle
  const estAdmin = user?.role === 'ADMIN';
  const estCaissier = user?.role === 'CAISSIER';
  const peutCalculerPaiements = estAdmin || estCaissier; // Les ADMIN peuvent aussi calculer
  const peutVoirPointages = estAdmin || estCaissier;
  
  const [activeTab, setActiveTab] = useState(estAdmin ? 'pointages' : 'employes');
  const [employes, setEmployes] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [calculEnCours, setCalculEnCours] = useState(false);
  const [detailCalcul, setDetailCalcul] = useState(null);
  
  // Filtres de période
  const [periode, setPeriode] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear()
  });

  // Formulaire de paiement
  const [formPaiement, setFormPaiement] = useState({
    montantPaye: 0,
    methodePaiement: 'ESPECES',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    chargerEmployes();
    chargerHistorique();
  }, [periode]);

  const chargerEmployes = async () => {
    try {
      setLoading(true);
      const response = await paiementJournalierService.listerEmployesJournaliers(periode.mois, periode.annee);
      setEmployes(response.data?.employes || []);
    } catch (error) {
      console.error('Erreur chargement employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const chargerHistorique = async () => {
    try {
      const response = await paiementJournalierService.obtenirHistorique({
        mois: periode.mois,
        annee: periode.annee
      });
      setHistorique(response.data?.paiements || []);
    } catch (error) {
      console.error('Erreur historique:', error);
    }
  };

  const calculerDetailPaiement = async (employeId) => {
    if (!peutCalculerPaiements) {
      toast.error('Permissions insuffisantes pour calculer les paiements');
      return;
    }
    
    try {
      setCalculEnCours(true);
      const response = await paiementJournalierService.obtenirDetailCalcul(employeId, periode.mois, periode.annee);
      setDetailCalcul(response.data);
      setFormPaiement(prev => ({
        ...prev,
        montantPaye: response.data.resteAPayer
      }));
    } catch (error) {
      console.error('Erreur calcul:', error);
      if (error.response?.status === 403) {
        toast.error('Accès refusé - Permissions insuffisantes pour calculer les paiements');
      } else {
        toast.error('Erreur lors du calcul du paiement');
      }
    } finally {
      setCalculEnCours(false);
    }
  };

  const enregistrerPaiement = async () => {
    if (!selectedEmploye || !detailCalcul) {
      toast.error('Veuillez sélectionner un employé et calculer le paiement');
      return;
    }

    if (formPaiement.montantPaye <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }

    try {
      const donnees = {
        employeId: selectedEmploye.employeId,
        mois: periode.mois,
        annee: periode.annee,
        ...formPaiement
      };
      
      const response = await paiementJournalierService.enregistrerPaiement(donnees);
      toast.success('Paiement enregistré avec succès !');
      
      // Rafraîchir les données
      await chargerEmployes();
      await chargerHistorique();
      
      // Réinitialiser la sélection
      setSelectedEmploye(null);
      setDetailCalcul(null);
      setFormPaiement({
        montantPaye: 0,
        methodePaiement: 'ESPECES',
        reference: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      toast.error('Erreur lors de l\'enregistrement du paiement');
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' XOF';
  };

  const moisOptions = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  👷 Paiements Journaliers
                </h1>
                <p className="text-gray-600">
                  Gestion des paiements pour les employés journaliers basée sur les pointages
                </p>
              </div>
              
              {/* Sélecteur de période */}
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
                  <select
                    value={periode.mois}
                    onChange={(e) => setPeriode(prev => ({ ...prev, mois: parseInt(e.target.value) }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {moisOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <select
                    value={periode.annee}
                    onChange={(e) => setPeriode(prev => ({ ...prev, annee: parseInt(e.target.value) }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Workflow */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 Workflow</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-medium text-blue-900">Sélectionner employé</div>
                    <div className="text-sm text-blue-700">Choisir l'employé journalier</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-medium text-green-900">Calculer paiement</div>
                    <div className="text-sm text-green-700">Basé sur les pointages validés</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-medium text-purple-900">Enregistrer paiement</div>
                    <div className="text-sm text-purple-700">Sauvegarder le paiement manuel</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {/* Indicateur de rôle */}
                <div className="flex items-center px-4 py-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    estAdmin ? 'bg-blue-100 text-blue-800' : 
                    estCaissier ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {estAdmin && '👨‍💼 Admin - Validation & Calcul'}
                    {estCaissier && '💰 Caissier - Calcul & Paiement'}
                    {!estAdmin && !estCaissier && '👤 Utilisateur'}
                  </div>
                </div>
                
                {/* Onglet Employés/Pointages - Tous peuvent voir */}
                <button
                  onClick={() => setActiveTab('employes')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'employes'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👥 Employés Journaliers
                </button>
                <button
                  onClick={() => setActiveTab('historique')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'historique'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Historique
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'employes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Liste des employés */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                👥 Employés Journaliers
              </h3>
              
              <div className="space-y-3">
                {employes.map((employe) => (
                  <div
                    key={employe.employeId}
                    onClick={() => setSelectedEmploye(employe)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedEmploye?.employeId === employe.employeId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {employe.prenom} {employe.nom}
                        </div>
                        <div className="text-sm text-gray-600">
                          Code: {employe.codeEmploye} • Taux: {formatMontant(employe.tauxJournalier)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employe.joursPointes} jours pointés • {employe.hasPointages ? '✅' : '❌'} Pointages
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          employe.resteAPayer > 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {formatMontant(employe.resteAPayer)}
                        </div>
                        <div className="text-xs text-gray-500">Reste à payer</div>
                      </div>
                    </div>
                  </div>
                ))}

                {employes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">👥</div>
                    <p>Aucun employé journalier trouvé</p>
                  </div>
                )}
              </div>
            </div>

            {/* Détail et paiement - Seulement pour CAISSIER */}
            {peutCalculerPaiements && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💰 Calcul et Paiement
                </h3>

                {selectedEmploye ? (
                <div className="space-y-6">
                  
                  {/* Bouton calculer */}
                  <div className="text-center">
                    <button
                      onClick={() => calculerDetailPaiement(selectedEmploye.employeId)}
                      disabled={calculEnCours}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        calculEnCours
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {calculEnCours ? '⏳ Calcul...' : '🧮 Calculer le Paiement'}
                    </button>
                  </div>

                  {/* Détail du calcul */}
                  {detailCalcul && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">📊 Détail du Calcul</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Jours pointés:</span>
                            <span className="font-medium ml-2">{detailCalcul.joursPointes}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Heures totales:</span>
                            <span className="font-medium ml-2">{detailCalcul.heuresPointes}h</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Salaire brut:</span>
                            <span className="font-medium ml-2">{formatMontant(detailCalcul.salaireBrutTotal)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Déductions:</span>
                            <span className="font-medium ml-2">{formatMontant(detailCalcul.deductions)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Salaire net:</span>
                            <span className="font-medium ml-2">{formatMontant(detailCalcul.salaireNet)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Déjà payé:</span>
                            <span className="font-medium ml-2">{formatMontant(detailCalcul.totalDejaPaye)}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-900">Reste à payer:</span>
                            <span className="text-xl font-bold text-green-600">
                              {formatMontant(detailCalcul.resteAPayer)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Formulaire de paiement */}
                      {detailCalcul.resteAPayer > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">💸 Enregistrer le Paiement</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Montant à payer
                              </label>
                              <input
                                type="number"
                                value={formPaiement.montantPaye}
                                onChange={(e) => setFormPaiement(prev => ({
                                  ...prev,
                                  montantPaye: parseInt(e.target.value) || 0
                                }))}
                                max={detailCalcul.resteAPayer}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Méthode de paiement
                              </label>
                              <select
                                value={formPaiement.methodePaiement}
                                onChange={(e) => setFormPaiement(prev => ({
                                  ...prev,
                                  methodePaiement: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="ESPECES">💵 Espèces</option>
                                <option value="VIREMENT_BANCAIRE">🏦 Virement</option>
                                <option value="ORANGE_MONEY">📱 Orange Money</option>
                                <option value="WAVE">🌊 Wave</option>
                                <option value="AUTRE">⚙️ Autre</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Référence (optionnel)
                            </label>
                            <input
                              type="text"
                              value={formPaiement.reference}
                              onChange={(e) => setFormPaiement(prev => ({
                                ...prev,
                                reference: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Numéro de transaction, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes (optionnel)
                            </label>
                            <textarea
                              value={formPaiement.notes}
                              onChange={(e) => setFormPaiement(prev => ({
                                ...prev,
                                notes: e.target.value
                              }))}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Notes additionnelles..."
                            />
                          </div>

                          <button
                            onClick={enregistrerPaiement}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            ✅ Enregistrer le Paiement
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">👈</div>
                  <p>Sélectionnez un employé pour commencer</p>
                </div>
              )}
              </div>
            )}

            {/* Section Admin - Information sur les pointages uniquement */}
            {estAdmin && selectedEmploye && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-600 mr-3">ℹ️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-1">Information Admin</h3>
                    <p className="text-sm text-yellow-700">
                      Vous consultez les informations d'un employé journalier. Seuls les caissiers peuvent calculer et effectuer les paiements.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">📊 Résumé Employé</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Nom complet</div>
                      <div className="font-medium">{selectedEmploye.prenom} {selectedEmploye.nom}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Code employé</div>
                      <div className="font-medium">{selectedEmploye.codeEmploye}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Type de contrat</div>
                      <div className="font-medium">Journalier</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Taux journalier</div>
                      <div className="font-medium">{formatMontant(selectedEmploye.tauxJournalier)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Jours pointés</div>
                      <div className={`font-medium ${selectedEmploye.joursPointes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedEmploye.joursPointes} jours
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Statut pointages</div>
                      <div className={`font-medium ${selectedEmploye.hasPointages ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedEmploye.hasPointages ? '✅ Validés' : '❌ Non validés'}
                      </div>
                    </div>
                  </div>
                  
                  {!selectedEmploye.hasPointages && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-red-800 text-sm">
                        ⚠️ Cet employé n'a pas de pointages validés pour cette période. 
                        Validez les pointages avant qu'un caissier puisse calculer le paiement.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Historique */}
        {activeTab === 'historique' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Historique des Paiements Journaliers
              </h3>

              {historique.length > 0 ? (
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
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Méthode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reçu
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historique.map((paiement) => (
                        <tr key={paiement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {paiement.employe?.prenom} {paiement.employe?.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {paiement.employe?.codeEmploye}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paiement.cycle?.periode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatMontant(paiement.montant)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {paiement.methodePaiement}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(paiement.creeLe).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {paiement.numeroRecu}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Aucun paiement journalier trouvé pour cette période</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaiementsJournaliersPage;