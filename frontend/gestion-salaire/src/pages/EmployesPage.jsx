import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import Button from '../components/ui/Button';
import EmployeModal from '../components/modals/EmployeModal';
import EmployeDetailsModal from '../components/modals/EmployeDetailsModal';
import employeService from '../services/employe.service';
import entrepriseService from '../services/entreprise.service';
import { useAuth } from '../context/AuthContext';

const EmployesPage = () => {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;

  const [employes, setEmployes] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeDetails, setSelectedEmployeDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Charger la liste des employés et des entreprises
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupération des employés
        let employesData = [];
        if (entrepriseId) {
          // Si l'utilisateur est associé à une entreprise, récupérer seulement les employés de celle-ci
          const response = await employeService.getEmployes(entrepriseId);
          employesData = response.data;
        } else {
          // Si admin, récupérer toutes les entreprises et leurs employés
          const entreprisesResponse = await entrepriseService.getEntreprises();
          setEntreprises(entreprisesResponse.data);
          
          // Récupérer tous les employés
          // Note: ceci dépend de la façon dont votre API est structurée
          const employesResponse = await employeService.getEmployes();
          employesData = employesResponse.data;
        }
        
        setEmployes(employesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Impossible de charger les données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [entrepriseId]);

  // Ouvrir le modal pour ajouter un employé
  const handleAddEmploye = () => {
    setSelectedEmploye(null);
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour modifier un employé
  const handleEditEmploye = (employe) => {
    setSelectedEmploye(employe);
    setIsModalOpen(true);
  };

  // Afficher les détails d'un employé
  const handleViewEmployeDetails = (employe) => {
    setSelectedEmployeDetails(employe);
    setIsDetailsModalOpen(true);
  };

  // Supprimer un employé
  const handleDeleteEmploye = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await employeService.desactiverEmploye(id);
        toast.success('Employé désactivé avec succès');
        // Mettre à jour la liste des employés
        setEmployes(employes.filter(e => e.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'employé:', error);
        toast.error('Impossible de supprimer l\'employé');
      }
    }
  };

  // Après une action réussie (création ou modification)
  const handleSuccess = async () => {
    try {
      // Recharger la liste des employés
      if (entrepriseId) {
        const response = await employeService.getEmployes(entrepriseId);
        setEmployes(response.data);
      } else {
        // Si admin, recharger tous les employés
        const response = await employeService.getEmployes();
        setEmployes(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des employés:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des employés</h1>
        <Button 
          onClick={handleAddEmploye}
          variant="primary"
          className="flex items-center"
        >
          <FaPlus className="mr-2" /> Ajouter un employé
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Chargement en cours...</p>
        </div>
      ) : employes.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Aucun employé trouvé</p>
          <Button 
            onClick={handleAddEmploye}
            variant="outline"
            className="mt-4"
          >
            Ajouter votre premier employé
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom & Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'embauche</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employes.map((employe) => (
                <tr key={employe.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employe.nom} {employe.prenom}
                        </div>
                        {!entrepriseId && (
                          <div className="text-sm text-gray-500">
                            {entreprises.find(e => e.id === employe.entrepriseId)?.nom || 'N/A'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employe.email}</div>
                    <div className="text-sm text-gray-500">{employe.telephone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employe.poste}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(employe.dateEmbauche).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employe.salaire.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employe.estActif 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }`}>
                      {employe.estActif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewEmployeDetails(employe)}
                        className="text-green-600 hover:text-green-900"
                        title="Voir les détails"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditEmploye(employe)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEmploye(employe.id)}
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

      {/* Modal pour ajouter/éditer un employé */}
      <EmployeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employe={selectedEmploye}
        entreprises={entreprises}
        onSuccess={handleSuccess}
      />

      {/* Modal pour afficher les détails de l'employé */}
      <EmployeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        employe={selectedEmployeDetails}
      />
    </div>
  );
};

export default EmployesPage;