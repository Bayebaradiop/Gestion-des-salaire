import React, { createContext, useState, useEffect, useContext } from 'react';
import cyclePaieService from '../services/cyclePaie.service';
import entrepriseService from '../services/entreprise.service';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const CyclePaieContext = createContext();

export const CyclePaieProvider = ({ children }) => {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [cycles, setCycles] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  // Fetch cycles
  const fetchCycles = async () => {
    try {
      setIsLoading(true);

      if (isAdmin) {
        // Admin: get all entreprises and cycles
        const entreprisesResponse = await entrepriseService.getEntreprises();
        setEntreprises(entreprisesResponse.data);

        const cyclesResponse = await cyclePaieService.getCyclesPaie();
        setCycles(cyclesResponse.data);
      } else {
        // Regular user: get cycles for their entreprise
        const cyclesResponse = await cyclePaieService.getCyclesPaie(entrepriseId);
        setCycles(cyclesResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cycles:', error);
      toast.error('Impossible de charger les cycles de paie');
    } finally {
      setIsLoading(false);
    }
  };

  // Create cycle
  const createCycle = async (cycleData) => {
    try {
      setIsLoading(true);
      const response = await cyclePaieService.creerCyclePaie(entrepriseId || cycleData.entrepriseId, cycleData);
      toast.success('Cycle de paie créé avec succès');
      await fetchCycles();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du cycle:', error);
      toast.error('Impossible de créer le cycle de paie');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update cycle
  const updateCycle = async (cycleId, cycleData) => {
    try {
      setIsLoading(true);
      const response = await cyclePaieService.modifierCyclePaie(cycleId, cycleData);
      toast.success('Cycle de paie modifié avec succès');
      await fetchCycles();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification du cycle:', error);
      toast.error('Impossible de modifier le cycle de paie');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete cycle
  const deleteCycle = async (cycleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cycle de paie ?')) {
      try {
        setIsLoading(true);
        await cyclePaieService.supprimerCycle(cycleId);
        toast.success('Cycle de paie supprimé avec succès');
        await fetchCycles();
      } catch (error) {
        console.error('Erreur lors de la suppression du cycle:', error);
        toast.error('Impossible de supprimer le cycle de paie');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Generate bulletins
  const generateBulletins = async (cycleId) => {
    try {
      setIsLoading(true);
      await cyclePaieService.genererBulletins(cycleId);
      toast.success('Bulletins générés avec succès');
      await fetchCycles();
    } catch (error) {
      console.error('Erreur lors de la génération des bulletins:', error);
      toast.error('Impossible de générer les bulletins');
    } finally {
      setIsLoading(false);
    }
  };

  // Approve cycle
  const approveCycle = async (cycleId) => {
    try {
      setIsLoading(true);
      await cyclePaieService.approuverCycle(cycleId);
      toast.success('Cycle approuvé avec succès');
      await fetchCycles();
    } catch (error) {
      console.error('Erreur lors de l\'approbation du cycle:', error);
      toast.error('Impossible d\'approuver le cycle');
    } finally {
      setIsLoading(false);
    }
  };

  // Close cycle
  const closeCycle = async (cycleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir clôturer ce cycle de paie ? Cette action est irréversible.')) {
      try {
        setIsLoading(true);
        await cyclePaieService.cloturerCycle(cycleId);
        toast.success('Cycle clôturé avec succès');
        await fetchCycles();
      } catch (error) {
        console.error('Erreur lors de la clôture du cycle:', error);
        toast.error('Impossible de clôturer le cycle');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get cycle by ID
  const getCycleById = async (cycleId) => {
    try {
      const response = await cyclePaieService.getCyclePaie(cycleId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du cycle:', error);
      throw error;
    }
  };

  // Get bulletins for cycle
  const getBulletinsForCycle = async (cycleId) => {
    try {
      const response = await cyclePaieService.getBulletinsCycle(cycleId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des bulletins:', error);
      throw error;
    }
  };

  // Get statistiques
  const getStatistiques = async (cycleId) => {
    try {
      const response = await cyclePaieService.getStatistiquesCycle(cycleId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  };

  // Initialize data
  useEffect(() => {
    fetchCycles();
  }, [entrepriseId, isAdmin]);

  const value = {
    // State
    cycles,
    entreprises,
    isLoading,
    selectedCycle,

    // Actions
    fetchCycles,
    createCycle,
    updateCycle,
    deleteCycle,
    generateBulletins,
    approveCycle,
    closeCycle,
    getCycleById,
    getBulletinsForCycle,
    getStatistiques,

    // Setters
    setSelectedCycle
  };

  return (
    <CyclePaieContext.Provider value={value}>
      {children}
    </CyclePaieContext.Provider>
  );
};

export const useCyclePaie = () => {
  const context = useContext(CyclePaieContext);
  if (!context) {
    throw new Error('useCyclePaie must be used within a CyclePaieProvider');
  }
  return context;
};