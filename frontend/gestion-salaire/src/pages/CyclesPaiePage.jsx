import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaCheck, FaLock } from 'react-icons/fa';
import Button from '../components/ui/Button';
import CyclePaieModal from '../components/modals/CyclePaieModal';
import cyclePaieService from '../services/cyclePaie.service';
import entrepriseService from '../services/entreprise.service';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

const CyclesPaiePage = () => {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;
  const isAdmin = user?.role === 'ADMIN';

  const [cycles, setCycles] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtenir les noms des mois
  const getMoisName = (mois) => {
    const moisNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNames[mois - 1] || 'Inconnu';
  };

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Chargement des cycles de paie
        if (isAdmin) {
          // Si admin, charger toutes les entreprises
          const entreprisesResponse = await entrepriseService.getEntreprises();
          setEntreprises(entreprisesResponse.data);
          
          // Et tous les cycles de paie
          const cyclesResponse = await cyclePaieService.getCyclesPaie();
          setCycles(cyclesResponse.data);
        } else {
          // Si utilisateur normal, charger seulement les cycles de son entreprise
          const cyclesResponse = await cyclePaieService.getCyclesPaie(entrepriseId);
          setCycles(cyclesResponse.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Impossible de charger les données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [entrepriseId, isAdmin]);

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
  const handleDeleteCycle = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cycle de paie ?')) {
      try {
        await cyclePaieService.supprimerCycle(id);
        toast.success('Cycle de paie supprimé avec succès');
        // Mettre à jour la liste des cycles
        setCycles(cycles.filter(c => c.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du cycle:', error);
        toast.error('Impossible de supprimer ce cycle de paie');
      }
    }
  };

  // Générer les bulletins pour un cycle
  const handleGenererBulletins = async (id) => {
    try {
      await cyclePaieService.genererBulletins(id);
      toast.success('Les bulletins de paie ont été générés avec succès');
      // Mettre à jour le cycle dans la liste
      const updatedCycles = cycles.map(c => 
        c.id === id ? { ...c, bulletinsGeneres: true } : c
      );
      setCycles(updatedCycles);
    } catch (error) {
      console.error('Erreur lors de la génération des bulletins:', error);
      toast.error('Impossible de générer les bulletins de paie');
    }
  };

  // Approuver un cycle
  const handleApprouverCycle = async (id) => {
    try {
      await cyclePaieService.approuverCycle(id);
      toast.success('Le cycle de paie a été approuvé avec succès');
      // Mettre à jour le cycle dans la liste
      const updatedCycles = cycles.map(c => 
        c.id === id ? { ...c, estApprouve: true } : c
      );
      setCycles(updatedCycles);
    } catch (error) {
      console.error('Erreur lors de l\'approbation du cycle:', error);
      toast.error('Impossible d\'approuver ce cycle de paie');
    }
  };

  // Clôturer un cycle
  const handleCloturerCycle = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir clôturer ce cycle de paie ? Cette action est irréversible.')) {
      try {
        await cyclePaieService.cloturerCycle(id);
        toast.success('Le cycle de paie a été clôturé avec succès');
        // Mettre à jour le cycle dans la liste
        const updatedCycles = cycles.map(c => 
          c.id === id ? { ...c, estCloture: true } : c
        );
        setCycles(updatedCycles);
      } catch (error) {
        console.error('Erreur lors de la clôture du cycle:', error);
        toast.error('Impossible de clôturer ce cycle de paie');
      }
    }
  };

  // Après une action réussie (création ou modification)
  const handleSuccess = async () => {
    try {
      // Recharger la liste des cycles
      const response = isAdmin 
        ? await cyclePaieService.getCyclesPaie()
        : await cyclePaieService.getCyclesPaie(entrepriseId);
      setCycles(response.data);
    } catch (error) {
      console.error('Erreur lors du rechargement des cycles:', error);
    }
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