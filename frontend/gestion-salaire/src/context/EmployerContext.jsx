import React, { createContext, useState, useEffect, useContext } from 'react';
import employeService from '../services/employe.service';
import entrepriseService from '../services/entreprise.service';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const EmployeContext = createContext();

export const EmployeProvider = ({ children }) => {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;

  // State
  const [employes, setEmployes] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    estActif: '',
    typeContrat: '',
    poste: ''
  });

  // Fetch employes
  const fetchEmployes = async (customFilters = {}) => {
    try {
      setIsLoading(true);
      const activeFilters = { ...filters, ...customFilters };

      let employesData = [];
      if (entrepriseId) {
        const response = await employeService.getEmployes(entrepriseId, activeFilters);
        employesData = response.data;
      } else {
        // Admin: get all entreprises and employes
        const entreprisesResponse = await entrepriseService.getEntreprises();
        setEntreprises(entreprisesResponse.data);

        const employesResponse = await employeService.getEmployes(null, activeFilters);
        employesData = employesResponse.data;
      }

      setEmployes(employesData);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Impossible de charger les employés');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch entreprises (for admin)
  const fetchEntreprises = async () => {
    if (!entrepriseId) {
      try {
        const response = await entrepriseService.getEntreprises();
        setEntreprises(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
      }
    }
  };

  // Create employe
  const createEmploye = async (employeData) => {
    try {
      setIsLoading(true);
      const response = await employeService.creerEmploye(entrepriseId || employeData.entrepriseId, employeData);
      toast.success('Employé créé avec succès');
      await fetchEmployes();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'employé:', error);
      toast.error('Impossible de créer l\'employé');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update employe
  const updateEmploye = async (employeId, employeData) => {
    try {
      setIsLoading(true);
      const response = await employeService.modifierEmploye(employeId, employeData);
      toast.success('Employé modifié avec succès');
      await fetchEmployes();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification de l\'employé:', error);
      toast.error('Impossible de modifier l\'employé');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete employe (deactivate)
  const deleteEmploye = async (employeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cet employé ?')) {
      try {
        setIsLoading(true);
        await employeService.desactiverEmploye(employeId);
        toast.success('Employé désactivé avec succès');
        await fetchEmployes();
      } catch (error) {
        console.error('Erreur lors de la désactivation de l\'employé:', error);
        toast.error('Impossible de désactiver l\'employé');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Activate employe
  const activateEmploye = async (employeId) => {
    try {
      setIsLoading(true);
      await employeService.activerEmploye(employeId);
      toast.success('Employé activé avec succès');
      await fetchEmployes();
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'employé:', error);
      toast.error('Impossible d\'activer l\'employé');
    } finally {
      setIsLoading(false);
    }
  };

  // Get employe by ID
  const getEmployeById = async (employeId) => {
    try {
      const response = await employeService.getEmploye(employeId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      throw error;
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      estActif: '',
      typeContrat: '',
      poste: ''
    });
  };

  // Get statistiques
  const getStatistiques = async () => {
    try {
      const response = await employeService.getStatistiquesEmployes(entrepriseId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  };

  // Initialize data
  useEffect(() => {
    fetchEmployes();
    fetchEntreprises();
  }, [entrepriseId]);

  const value = {
    // State
    employes,
    entreprises,
    isLoading,
    filters,

    // Actions
    fetchEmployes,
    createEmploye,
    updateEmploye,
    deleteEmploye,
    activateEmploye,
    getEmployeById,
    updateFilters,
    clearFilters,
    getStatistiques
  };

  return (
    <EmployeContext.Provider value={value}>
      {children}
    </EmployeContext.Provider>
  );
};

export const useEmploye = () => {
  const context = useContext(EmployeContext);
  if (!context) {
    throw new Error('useEmploye must be used within an EmployeProvider');
  }
  return context;
};
