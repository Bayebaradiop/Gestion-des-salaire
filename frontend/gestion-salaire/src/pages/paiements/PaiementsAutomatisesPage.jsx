import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import CalculerPaiementAutomatise from '../../components/paiements/CalculerPaiementAutomatise';
import HistoriquePaiementsAutomatises from '../../components/paiements/HistoriquePaiementsAutomatises';
import paiementAutomatiseService from '../../services/paiementAutomatise.service';
import employeService from '../../services/employe.service';

/**
 * Page principale des paiements automatisés basés sur les pointages
 * Intègre la séparation des rôles Admin/Caissier
 */
const PaiementsAutomatisesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('historique');
  const [employes, setEmployes] = useState([]);
  const [employeSelectionne, setEmployeSelectionne] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const estCaissier = paiementAutomatiseService.peutCalculerPaiements();
  const estAdmin = paiementAutomatiseService.peutValiderPointages();

  useEffect(() => {
    chargerEmployes();
  }, []);

  const chargerEmployes = async () => {
    try {
      setLoading(true);
      const entrepriseId = user.entrepriseId || 1;
      const response = await employeService.obtenirEmployesEntreprise(entrepriseId);
      setEmployes(response.employes || []);
    } catch (error) {
      console.error('Erreur chargement employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const handlePaiementCalcule = (resultat) => {
    toast.success(`Paiement calculé avec succès !`);
    // Actualiser l'historique si nécessaire
    if (activeTab === 'historique') {
      // Force la réactualisation de l'historique
      window.location.reload();
    }
  };

  const tabs = [
    {
      id: 'historique',
      label: '📊 Historique',
      icon: '📊',
      description: 'Consulter l\'historique des paiements'
    },
    {
      id: 'calculer',
      label: '💰 Calculer',
      icon: '💰',
      description: 'Calculer un nouveau paiement',
      visible: estCaissier || estAdmin
    }
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  💰 Paiements Automatisés
                </h1>
                <p className="text-gray-600">
                  Système basé sur les pointages avec séparation des rôles
                </p>
              </div>
              
              {/* Indicateur de rôle */}
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  estAdmin ? 'bg-blue-100 text-blue-800' : 
                  estCaissier ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {estAdmin && '👨‍💼 Administrateur'}
                  {estCaissier && '💰 Caissier'}
                  {!estAdmin && !estCaissier && '👤 Utilisateur'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {estAdmin && 'Peut valider les pointages'}
                  {estCaissier && 'Peut calculer et effectuer les paiements'}
                  {!estAdmin && !estCaissier && 'Consultation uniquement'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow expliqué */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔄 Workflow Paiement Automatisé
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div className="font-medium text-blue-900">👨‍💼 ADMIN</div>
                <div className="text-sm text-blue-700">Valide les pointages de la période</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div className="font-medium text-green-900">💰 CAISSIER</div>
                <div className="text-sm text-green-700">Calcule le paiement basé sur pointages</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div className="font-medium text-purple-900">💸 CAISSIER</div>
                <div className="text-sm text-purple-700">Effectue et marque le paiement</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {tabs.filter(tab => tab.visible !== false).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === 'historique' && (
            <HistoriquePaiementsAutomatises 
              entrepriseId={user.entrepriseId || 1}
            />
          )}

          {activeTab === 'calculer' && (
            <div className="space-y-6">
              {/* Sélection d'employé */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👤 Sélectionner un employé
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employes.map((employe) => (
                    <div
                      key={employe.id}
                      onClick={() => setEmployeSelectionne(employe)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        employeSelectionne?.id === employe.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {employe.prenom} {employe.nom}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          employe.typeContrat === 'FIXE' ? 'bg-blue-100 text-blue-800' :
                          employe.typeContrat === 'JOURNALIER' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {paiementAutomatiseService.obtenirLabelTypeContrat(employe.typeContrat)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {employe.poste}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Code: {employe.codeEmploye}
                      </div>
                    </div>
                  ))}
                </div>

                {employes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">👥</div>
                    <p>Aucun employé trouvé</p>
                  </div>
                )}
              </div>

              {/* Composant de calcul */}
              {employeSelectionne && (
                <CalculerPaiementAutomatise
                  employeId={employeSelectionne.id}
                  employe={employeSelectionne}
                  onPaiementCalcule={handlePaiementCalcule}
                />
              )}
            </div>
          )}
        </div>

        {/* Information sur les permissions */}
        {!estAdmin && !estCaissier && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <div className="font-medium text-yellow-800">Permissions limitées</div>
                <div className="text-sm text-yellow-700">
                  Vous pouvez consulter l'historique mais pas effectuer de nouvelles actions. 
                  Contactez un administrateur pour modifier vos permissions.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaiementsAutomatisesPage;