import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaPlus, FaTrash, FaCog, FaBuilding, FaUsers, FaMoneyBillWave,
  FaChartLine, FaExclamationTriangle, FaHistory, FaUserShield,
  FaPlay, FaPause, FaEye, FaKey, FaArrowUp, FaArrowDown,
  FaCalendarAlt, FaCreditCard, FaFileInvoiceDollar
} from 'react-icons/fa';
import Button from '../components/ui/Button';
import EntrepriseModal from '../components/modals/EntrepriseModal';
import entrepriseService from '../services/entreprise.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entreprises, setEntreprises] = useState([]);
  const [stats, setStats] = useState({
    totalEntreprises: 0,
    totalUtilisateurs: 0,
    totalEmployes: 0,
    masseSalarialeTotale: 0,
    montantTotalPaye: 0,
    montantTotalRestant: 0,
    totalBulletins: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Charger les données du dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await entrepriseService.getEntreprises();
        const entreprisesData = response.data;

        setEntreprises(entreprisesData);

        // Calculer les statistiques globales
        const totalEntreprises = entreprisesData.length;
        const totalUtilisateurs = entreprisesData.reduce((sum, e) => sum + (e.nombreEmployes || 0), 0);
        const totalEmployes = entreprisesData.reduce((sum, e) => sum + (e.nombreEmployesActifs || 0), 0);
        const masseSalarialeTotale = entreprisesData.reduce((sum, e) => sum + (e.masseSalarialeMensuelle || 0), 0);

        // Données simulées pour les paiements et bulletins (à remplacer par vraies données API)
        const montantTotalPaye = masseSalarialeTotale * 0.8; // Simulation
        const montantTotalRestant = masseSalarialeTotale * 0.2; // Simulation
        const totalBulletins = totalEmployes * 12; // Simulation

        setStats({
          totalEntreprises,
          totalUtilisateurs,
          totalEmployes,
          masseSalarialeTotale,
          montantTotalPaye,
          montantTotalRestant,
          totalBulletins
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Impossible de charger les données du dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Actions pour les entreprises
  const handleAddEntreprise = () => {
    setSelectedEntreprise(null);
    setIsModalOpen(true);
  };

  const handleEditEntreprise = (entreprise) => {
    setSelectedEntreprise(entreprise);
    setIsModalOpen(true);
  };

  const handleDeleteEntreprise = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.')) {
      try {
        await entrepriseService.supprimerEntreprise(id);
        toast.success('Entreprise supprimée avec succès');
        setEntreprises(entreprises.filter(e => e.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Impossible de supprimer l\'entreprise');
      }
    }
  };

  const handleManageEntreprise = (entrepriseId) => {
    navigate(`/super-admin/entreprises/${entrepriseId}`);
  };

  const handleToggleEntrepriseStatus = async (entreprise) => {
    try {
      await entrepriseService.toggleStatutEntreprise(entreprise.id);
      toast.success(`Entreprise ${entreprise.estActif ? 'suspendue' : 'activée'} avec succès`);
      // Recharger les données
      const response = await entrepriseService.getEntreprises();
      setEntreprises(response.data);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Impossible de changer le statut de l\'entreprise');
    }
  };

  const handleSuccess = async () => {
    try {
      const response = await entrepriseService.getEntreprises();
      setEntreprises(response.data);
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
    }
  };

  // Vérifier que l'utilisateur est SUPER_ADMIN
  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaUserShield className="mx-auto text-6xl text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Vous devez être Super Administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Gestion globale des entreprises et salaires</p>
            </div>
            <Button
              onClick={handleAddEntreprise}
              variant="primary"
              className="flex items-center px-4 py-2"
            >
              <FaPlus className="mr-2" /> Nouvelle Entreprise
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: FaChartLine },
              { id: 'companies', label: 'Entreprises', icon: FaBuilding },
              { id: 'admins', label: 'Administrateurs', icon: FaUserShield },
              { id: 'alerts', label: 'Alertes', icon: FaExclamationTriangle },
              { id: 'logs', label: 'Logs', icon: FaHistory }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FaBuilding className="text-blue-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Entreprises</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEntreprises}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <FaUsers className="text-green-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Employés actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEmployes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <FaMoneyBillWave className="text-purple-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Masse salariale</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.masseSalarialeTotale.toLocaleString()} XOF
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <FaFileInvoiceDollar className="text-orange-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bulletins générés</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBulletins}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Salary Evolution Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaChartLine className="mr-2 text-blue-600" />
                  Évolution de la masse salariale
                </h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <FaChartLine className="mx-auto text-4xl mb-2" />
                    <p>Graphique d'évolution mensuelle</p>
                    <p className="text-sm">Intégration Chart.js recommandée</p>
                  </div>
                </div>
              </div>

              {/* Employee Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUsers className="mr-2 text-green-600" />
                  Répartition des employés
                </h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <FaUsers className="mx-auto text-4xl mb-2" />
                    <p>Camembert par entreprise</p>
                    <p className="text-sm">Intégration Chart.js recommandée</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Comparison */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-purple-600" />
                Comparaison paiements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.montantTotalPaye.toLocaleString()} XOF
                  </div>
                  <p className="text-gray-600">Montant payé</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {stats.montantTotalRestant.toLocaleString()} XOF
                  </div>
                  <p className="text-gray-600">Montant restant</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Gestion des entreprises</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entreprise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NINEA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entreprises.map((entreprise) => (
                    <tr key={entreprise.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaBuilding className="text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{entreprise.nom}</div>
                            <div className="text-sm text-gray-500">{entreprise.nombreEmployesActifs || 0} employés</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entreprise.ninea || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entreprise.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entreprise.estActif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {entreprise.estActif ? 'Active' : 'Suspendue'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entreprise.creeLe).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleManageEntreprise(entreprise.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Gérer"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditEntreprise(entreprise)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Modifier"
                          >
                            <FaCog />
                          </button>
                          <button
                            onClick={() => handleToggleEntrepriseStatus(entreprise)}
                            className={entreprise.estActif ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                            title={entreprise.estActif ? "Suspendre" : "Activer"}
                          >
                            {entreprise.estActif ? <FaPause /> : <FaPlay />}
                          </button>
                          <button
                            onClick={() => handleDeleteEntreprise(entreprise.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUserShield className="mr-2 text-purple-600" />
                Gestion des administrateurs
              </h3>
              <div className="text-center py-12 text-gray-500">
                <FaUserShield className="mx-auto text-4xl mb-4" />
                <p>Fonctionnalité de gestion des administrateurs</p>
                <p className="text-sm">À implémenter avec les APIs appropriées</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaExclamationTriangle className="mr-2 text-orange-600" />
                Alertes et notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FaExclamationTriangle className="text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-800">Entreprise ABC en retard de paiement</p>
                    <p className="text-sm text-yellow-700">Paiement dû depuis 15 jours</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <FaExclamationTriangle className="text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-800">Tentative d'accès non autorisée</p>
                    <p className="text-sm text-red-700">IP: 192.168.1.100 - 3 tentatives échouées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaHistory className="mr-2 text-gray-600" />
              Logs et suivi d'activité
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <FaCalendarAlt className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouvelle entreprise créée</p>
                  <p className="text-sm text-gray-600">Entreprise "Tech Solutions" ajoutée par Super Admin</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <FaUsers className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Connexion administrateur</p>
                  <p className="text-sm text-gray-600">Admin de "Global Corp" s'est connecté</p>
                  <p className="text-xs text-gray-500">Il y a 4 heures</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal pour ajouter/éditer une entreprise */}
      <EntrepriseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entreprise={selectedEntreprise}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default SuperAdminDashboard;