import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaUserPlus, FaUsers, FaUser, FaBuilding, FaEdit, FaTrash } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import EntrepriseLogo from '../components/ui/EntrepriseLogo';
import entrepriseService from '../services/entreprise.service';
import employeService from '../services/employe.service';
import authService from '../services/auth.service';
import UserModal from '../components/modals/UserModal';
import EmployeModalSuperAdmin from '../components/modals/EmployeModalSuperAdmin';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const SuperAdminEntrepriseDetailsPage = () => {
  const { entrepriseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entreprise, setEntreprise] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('utilisateurs');

  // États pour les modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEmployeModalOpen, setIsEmployeModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'user' ou 'employe'

  // Charger les données de l'entreprise
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [entrepriseRes, utilisateursRes, employesRes] = await Promise.all([
          entrepriseService.getEntrepriseById(entrepriseId),
          entrepriseService.getUtilisateursEntreprise(entrepriseId),
          employeService.getEmployesByEntreprise(entrepriseId)
        ]);

        setEntreprise(entrepriseRes.data);
        setUtilisateurs(utilisateursRes.data);
        setEmployes(employesRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Impossible de charger les données de l\'entreprise');
      } finally {
        setIsLoading(false);
      }
    };

    if (entrepriseId) {
      fetchData();
    }
  }, [entrepriseId]);

  // Gestionnaires pour les utilisateurs
  const handleOpenUserModal = (user = null) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSuccess = async () => {
    // Recharger les utilisateurs
    try {
      const utilisateursRes = await entrepriseService.getUtilisateursEntreprise(entrepriseId);
      setUtilisateurs(utilisateursRes.data);
      toast.success(selectedUser ? 'Utilisateur modifié avec succès' : 'Utilisateur ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors du rechargement des utilisateurs:', error);
      toast.error('Erreur lors du rechargement des données');
    }
  };

  const handleDeleteUser = (user) => {
    setItemToDelete(user);
    setDeleteType('user');
    setIsConfirmationModalOpen(true);
  };

  // Gestionnaires pour les employés
  const handleOpenEmployeModal = (employe = null) => {
    setSelectedEmploye(employe);
    setIsEmployeModalOpen(true);
  };

  const handleCloseEmployeModal = () => {
    setIsEmployeModalOpen(false);
    setSelectedEmploye(null);
  };

  const handleEmployeSuccess = async () => {
    // Recharger les employés
    try {
      const employesRes = await employeService.getEmployesByEntreprise(entrepriseId);
      setEmployes(employesRes.data);
      toast.success(selectedEmploye ? 'Employé modifié avec succès' : 'Employé ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors du rechargement des employés:', error);
      toast.error('Erreur lors du rechargement des données');
    }
  };

  const handleDeleteEmploye = (employe) => {
    setItemToDelete(employe);
    setDeleteType('employe');
    setIsConfirmationModalOpen(true);
  };

  // Gestionnaire de confirmation de suppression
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    try {
      if (deleteType === 'user') {
        await entrepriseService.supprimerUtilisateurEntreprise(entrepriseId, itemToDelete.id);
        setUtilisateurs(prev => prev.filter(u => u.id !== itemToDelete.id));
        toast.success('Utilisateur supprimé avec succès');
      } else if (deleteType === 'employe') {
        await employeService.supprimerEmploye(itemToDelete.id);
        setEmployes(prev => prev.filter(e => e.id !== itemToDelete.id));
        toast.success('Employé supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationModalOpen(false);
    setItemToDelete(null);
    setDeleteType('');
  };

  // Vérifier que l'utilisateur est SUPER_ADMIN
  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">Accès refusé. Vous devez être Super Administrateur.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <p className="text-gray-500">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (!entreprise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">Entreprise non trouvée</p>
          <Button onClick={() => navigate('/super-admin')} className="mt-4">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            onClick={() => navigate('/super-admin')}
            variant="outline"
            className="mr-4"
          >
            <FaArrowLeft className="mr-2" /> Retour
          </Button>
          <div className="flex items-center space-x-4">
            <EntrepriseLogo 
              entreprise={entreprise} 
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaBuilding className="mr-3" />
                {entreprise.nom}
              </h1>
              <p className="text-gray-600">{entreprise.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de l'entreprise */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Informations de l'entreprise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Adresse</p>
            <p className="font-medium">{entreprise.adresse || 'Non spécifiée'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Téléphone</p>
            <p className="font-medium">{entreprise.telephone || 'Non spécifié'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Devise</p>
            <p className="font-medium">{entreprise.devise}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Période de paie</p>
            <p className="font-medium">{entreprise.periodePaie}</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaUsers className="text-blue-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-500">Utilisateurs</p>
              <p className="text-2xl font-bold">{utilisateurs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaUser className="text-green-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-500">Employés actifs</p>
              <p className="text-2xl font-bold">{entreprise.nombreEmployesActifs || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaBuilding className="text-purple-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-500">Masse salariale</p>
              <p className="text-2xl font-bold">
                {entreprise.masseSalarialeMensuelle ?
                  `${entreprise.masseSalarialeMensuelle.toLocaleString()} ${entreprise.devise}` :
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('utilisateurs')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'utilisateurs'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Utilisateurs ({utilisateurs.length})
            </button>
            <button
              onClick={() => setActiveTab('employes')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'employes'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Employés ({employes.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'utilisateurs' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Utilisateurs de l'entreprise</h3>
                <Button
                  variant="primary"
                  className="flex items-center"
                  onClick={() => handleOpenUserModal()}
                >
                  <FaUserPlus className="mr-2" /> Ajouter un utilisateur
                </Button>
              </div>

              {utilisateurs.length === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucun utilisateur trouvé</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleOpenUserModal()}
                  >
                    Ajouter le premier utilisateur
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Créé le
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {utilisateurs.map((utilisateur) => (
                        <tr key={utilisateur.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {utilisateur.prenom} {utilisateur.nom}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{utilisateur.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              utilisateur.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800'
                                : utilisateur.role === 'CAISSIER'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {utilisateur.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              utilisateur.estActif
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {utilisateur.estActif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(utilisateur.creeLe).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOpenUserModal(utilisateur)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(utilisateur)}
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
              )}
            </div>
          )}

          {activeTab === 'employes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Employés de l'entreprise</h3>
                <Button
                  variant="primary"
                  className="flex items-center"
                  onClick={() => handleOpenEmployeModal()}
                >
                  <FaUserPlus className="mr-2" /> Ajouter un employé
                </Button>
              </div>

              {employes.length === 0 ? (
                <div className="text-center py-8">
                  <FaUser className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucun employé trouvé</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleOpenEmployeModal()}
                  >
                    Ajouter le premier employé
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Poste
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type contrat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employes.map((employe) => (
                        <tr key={employe.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{employe.codeEmploye}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {employe.prenom} {employe.nom}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{employe.poste}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {employe.typeContrat}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              employe.estActif
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {employe.estActif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleOpenEmployeModal(employe)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteEmploye(employe)}
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        user={selectedUser}
        entrepriseId={entrepriseId}
        onSuccess={handleUserSuccess}
      />

      <EmployeModalSuperAdmin
        isOpen={isEmployeModalOpen}
        onClose={handleCloseEmployeModal}
        employe={selectedEmploye}
        entrepriseId={entrepriseId}
        onSuccess={handleEmployeSuccess}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer ${deleteType === 'user' ? 'cet utilisateur' : 'cet employé'} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};

export default SuperAdminEntrepriseDetailsPage;