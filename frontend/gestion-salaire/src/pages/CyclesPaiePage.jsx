import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaCheck, FaLock } from 'react-icons/fa';
import Button from '../components/ui/Button';
import CyclePaieModal from '../components/modals/CyclePaieModal';
import { useCyclePaie } from '../context/cyclepaiContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

const CyclesPaiePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const {
    cycles,
    entreprises,
    isLoading,
    selectedCycle,
    fetchCycles,
    deleteCycle,
    generateBulletins,
    approveCycle,
    closeCycle,
    setSelectedCycle
  } = useCyclePaie();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtenir les noms des mois
  const getMoisName = (mois) => {
    const moisNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNames[mois - 1] || 'Inconnu';
  };

  // Ouvrir le modal pour ajouter un cycle
  const handleAddCycle = () => {
    setSelectedCycle(null);
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour modifier un cycle
  const handleEditCycle = (cycle) => {
    setSelectedCycle(cycle);
    setIsModalOpen(true);
  };

  // Supprimer un cycle
  const handleDeleteCycle = (id) => {
    deleteCycle(id);
  };

  // Générer les bulletins pour un cycle
  const handleGenererBulletins = (id) => {
    generateBulletins(id);
  };

  // Approuver un cycle
  const handleApprouverCycle = (id) => {
    approveCycle(id);
  };

  // Clôturer un cycle
  const handleCloturerCycle = (id) => {
    closeCycle(id);
  };

  // Après une action réussie (création ou modification)
  const handleSuccess = () => {
    fetchCycles();
    setIsModalOpen(false);
  };

  // Trouver le nom de l'entreprise pour un cycle
  const getEntrepriseName = (entrepriseId) => {
    const entreprise = entreprises.find(e => e.id === entrepriseId);
    return entreprise ? entreprise.nom : 'Inconnue';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des cycles de paie</h1>
        <Button 
          onClick={handleAddCycle}
          variant="primary"
          className="flex items-center"
        >
          <FaPlus className="mr-2" /> Ajouter un cycle
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Chargement en cours...</p>
        </div>
      ) : cycles.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Aucun cycle de paie trouvé</p>
          <Button 
            onClick={handleAddCycle}
            variant="outline"
            className="mt-4"
          >
            Créer votre premier cycle de paie
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cycles.map((cycle) => (
                <tr key={cycle.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getMoisName(cycle.mois)} {cycle.annee}
                    </div>
                  </td>
                  
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getEntrepriseName(cycle.entrepriseId)}
                      </div>
                    </td>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Du {formatDate(cycle.dateDebut)} au {formatDate(cycle.dateFin)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cycle.estCloture ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Clôturé
                      </span>
                    ) : cycle.estApprouve ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approuvé
                      </span>
                    ) : cycle.bulletinsGeneres ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Bulletins générés
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {!cycle.estCloture && !cycle.estApprouve && (
                        <button
                          onClick={() => handleEditCycle(cycle)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                      )}
                      
                      {!cycle.bulletinsGeneres && !cycle.estCloture && !cycle.estApprouve && (
                        <button
                          onClick={() => handleDeleteCycle(cycle.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      )}
                      
                      {!cycle.bulletinsGeneres && !cycle.estCloture && (
                        <button
                          onClick={() => handleGenererBulletins(cycle.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Générer les bulletins"
                        >
                          <FaFileAlt />
                        </button>
                      )}
                      
                      {cycle.bulletinsGeneres && !cycle.estApprouve && !cycle.estCloture && (
                        <button
                          onClick={() => handleApprouverCycle(cycle.id)}
                          className="text-amber-600 hover:text-amber-900"
                          title="Approuver"
                        >
                          <FaCheck />
                        </button>
                      )}
                      
                      {cycle.estApprouve && !cycle.estCloture && (
                        <button
                          onClick={() => handleCloturerCycle(cycle.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Clôturer"
                        >
                          <FaLock />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal pour ajouter/éditer un cycle */}
      <CyclePaieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cyclePaie={selectedCycle}
        entreprises={entreprises}
        isAdmin={isAdmin}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CyclesPaiePage;