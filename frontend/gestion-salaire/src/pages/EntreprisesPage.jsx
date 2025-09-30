import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaUsers } from 'react-icons/fa';
import Button from '../components/ui/Button';
import EntrepriseLogo from '../components/ui/EntrepriseLogo';
import EntrepriseModal from '../components/modals/EntrepriseModal';
import entrepriseService from '../services/entreprise.service';
import { useNavigate } from 'react-router-dom';

const EntreprisesPage = () => {
  const navigate = useNavigate();
  const [entreprises, setEntreprises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger la liste des entreprises
  useEffect(() => {
    const fetchEntreprises = async () => {
      try {
        setIsLoading(true);
        const response = await entrepriseService.getEntreprises();
        setEntreprises(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
        toast.error('Impossible de charger les entreprises');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntreprises();
  }, []);

  // Ouvrir le modal pour ajouter une entreprise
  const handleAddEntreprise = () => {
    setSelectedEntreprise(null);
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour modifier une entreprise
  const handleEditEntreprise = (entreprise) => {
    setSelectedEntreprise(entreprise);
    setIsModalOpen(true);
  };

  // Supprimer une entreprise
  const handleDeleteEntreprise = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.')) {
      try {
        // Note: Votre API devrait probablement avoir une méthode spécifique pour la suppression
        await entrepriseService.supprimerEntreprise(id);
        toast.success('Entreprise supprimée avec succès');
        // Mettre à jour la liste des entreprises
        setEntreprises(entreprises.filter(e => e.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'entreprise:', error);
        toast.error('Impossible de supprimer l\'entreprise');
      }
    }
  };

  // Naviguer vers la page des employés d'une entreprise
  const handleViewEmployes = (entrepriseId) => {
    navigate(`/entreprises/${entrepriseId}/employes`);
  };

  // Après une action réussie (création ou modification)
  const handleSuccess = async () => {
    try {
      // Recharger la liste des entreprises
      const response = await entrepriseService.getEntreprises();
      setEntreprises(response.data);
    } catch (error) {
      console.error('Erreur lors du rechargement des entreprises:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des entreprises</h1>
        <Button 
          onClick={handleAddEntreprise}
          variant="primary"
          className="flex items-center"
        >
          <FaPlus className="mr-2" /> Ajouter une entreprise
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Chargement en cours...</p>
        </div>
      ) : entreprises.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Aucune entreprise trouvée</p>
          <Button 
            onClick={handleAddEntreprise}
            variant="outline"
            className="mt-4"
          >
            Ajouter votre première entreprise
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entreprises.map((entreprise) => (
            <div 
              key={entreprise.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <EntrepriseLogo 
                      entreprise={entreprise} 
                      size="md"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{entreprise.nom}</h3>
                      <p className="text-sm text-gray-500">{entreprise.secteurActivite}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditEntreprise(entreprise)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteEntreprise(entreprise.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Adresse:</span> {entreprise.adresse}</p>
                  <p><span className="font-medium">Téléphone:</span> {entreprise.telephone}</p>
                  <p><span className="font-medium">Email:</span> {entreprise.email}</p>
                  <p><span className="font-medium">NINEA:</span> {entreprise.ninea}</p>
                  <p><span className="font-medium">RCCM:</span> {entreprise.rccm}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50">
                <Button
                  onClick={() => handleViewEmployes(entreprise.id)}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <FaUsers className="mr-2" /> Voir les employés
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default EntreprisesPage;