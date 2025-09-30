import React, { createContext, useState, useEffect, useContext } from 'react';
import entrepriseService from '../services/entreprise.service';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EntrepriseContext = createContext();

export const EntrepriseProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [entreprises, setEntreprises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState(null);

  // Fetch entreprises
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

  // Create entreprise
  const createEntreprise = async (entrepriseData) => {
    try {
      setIsLoading(true);
      const response = await entrepriseService.creerEntreprise(entrepriseData);
      toast.success('Entreprise créée avec succès');
      await fetchEntreprises();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'entreprise:', error);
      toast.error('Impossible de créer l\'entreprise');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update entreprise
  const updateEntreprise = async (entrepriseId, entrepriseData) => {
    try {
      setIsLoading(true);
      const response = await entrepriseService.modifierEntreprise(entrepriseId, entrepriseData);
      toast.success('Entreprise modifiée avec succès');
      await fetchEntreprises();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification de l\'entreprise:', error);
      toast.error('Impossible de modifier l\'entreprise');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete entreprise
  const deleteEntreprise = async (entrepriseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.')) {
      try {
        setIsLoading(true);
        await entrepriseService.supprimerEntreprise(entrepriseId);
        toast.success('Entreprise supprimée avec succès');
        await fetchEntreprises();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'entreprise:', error);
        toast.error('Impossible de supprimer l\'entreprise');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Toggle entreprise status
  const toggleEntrepriseStatus = async (entrepriseId) => {
    try {
      setIsLoading(true);
      await entrepriseService.toggleStatutEntreprise(entrepriseId);
      toast.success('Statut de l\'entreprise modifié avec succès');
      await fetchEntreprises();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast.error('Impossible de modifier le statut');
    } finally {
      setIsLoading(false);
    }
  };

  // Get entreprise by ID
  const getEntrepriseById = async (entrepriseId) => {
    try {
      const response = await entrepriseService.getEntrepriseById(entrepriseId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entreprise:', error);
      throw error;
    }
  };

  // Upload logo
  const uploadLogo = async (entrepriseId, logoFile) => {
    try {
      setIsLoading(true);
      const response = await entrepriseService.uploadLogoEntreprise(entrepriseId, logoFile);
      toast.success('Logo uploadé avec succès');
      await fetchEntreprises();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'upload du logo:', error);
      toast.error('Impossible d\'uploader le logo');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get statistiques
  const getStatistiques = async (entrepriseId) => {
    try {
      const response = await entrepriseService.getStatistiquesEntreprise(entrepriseId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  };

  // Navigation helpers
  const navigateToEmployes = (entrepriseId) => {
    navigate(`/entreprises/${entrepriseId}/employes`);
  };

  // Initialize data
  useEffect(() => {
    if (isAdmin) {
      fetchEntreprises();
    }
  }, [isAdmin]);

  const value = {
    // State
    entreprises,
    isLoading,
    selectedEntreprise,

    // Actions
    fetchEntreprises,
    createEntreprise,
    updateEntreprise,
    deleteEntreprise,
    toggleEntrepriseStatus,
    getEntrepriseById,
    uploadLogo,
    getStatistiques,
    navigateToEmployes,

    // Setters
    setSelectedEntreprise
  };

  return (
    <EntrepriseContext.Provider value={value}>
      {children}
    </EntrepriseContext.Provider>
  );
};

export const useEntreprise = () => {
  const context = useContext(EntrepriseContext);
  if (!context) {
    throw new Error('useEntreprise must be used within an EntrepriseProvider');
  }
  return context;
};