import React, { createContext, useState, useEffect, useContext } from 'react';
import bulletinPaieService from '../services/bulletinPaie.service';
import cyclePaieService from '../services/cyclePaie.service';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const BulletinPaieContext = createContext();

export const BulletinPaieProvider = ({ children }) => {
  const { user } = useAuth();

  // State
  const [bulletins, setBulletins] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);

  // Fetch bulletins for a cycle
  const fetchBulletins = async (cycleId) => {
    try {
      setIsLoading(true);
      const response = await cyclePaieService.getBulletinsCycle(cycleId);
      setBulletins(response.data);

      // Also fetch cycle info if not already set
      if (!currentCycle || currentCycle.id !== cycleId) {
        try {
          const cycleResponse = await cyclePaieService.getCyclePaie(cycleId);
          setCurrentCycle(cycleResponse.data);
        } catch (cycleError) {
          console.error('Erreur lors du chargement du cycle:', cycleError);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins:', error);
      toast.error('Impossible de charger les bulletins');
    } finally {
      setIsLoading(false);
    }
  };

  // Get bulletin by ID
  const getBulletinById = async (bulletinId) => {
    try {
      const response = await bulletinPaieService.getBulletin(bulletinId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du bulletin:', error);
      throw error;
    }
  };

  // Download bulletin PDF
  const downloadBulletinPdf = async (bulletinId) => {
    try {
      const response = await bulletinPaieService.getBulletinPdf(bulletinId);
      return response;
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw error;
    }
  };

  // Record payment
  const recordPayment = async (bulletinId, paymentData) => {
    try {
      setIsLoading(true);
      const response = await bulletinPaieService.enregistrerPaiement(bulletinId, paymentData);
      toast.success('Paiement enregistré avec succès');
      await fetchBulletins(currentCycle?.id);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      toast.error('Impossible d\'enregistrer le paiement');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get payment history
  const getPaymentHistory = async (bulletinId) => {
    try {
      const response = await bulletinPaieService.getPaiementsBulletin(bulletinId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  };

  // Get bulletins for employee
  const getBulletinsForEmployee = async (employeId) => {
    try {
      const response = await bulletinPaieService.getBulletinsEmploye(employeId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des bulletins:', error);
      throw error;
    }
  };

  // Validate bulletin
  const validateBulletin = async (bulletinId) => {
    try {
      setIsLoading(true);
      const response = await bulletinPaieService.validerBulletin(bulletinId);
      toast.success('Bulletin validé avec succès');
      await fetchBulletins(currentCycle?.id);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation du bulletin:', error);
      toast.error('Impossible de valider le bulletin');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get bulletin details
  const getBulletinDetails = async (bulletinId) => {
    try {
      const response = await bulletinPaieService.getBulletinDetails(bulletinId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      throw error;
    }
  };

  // Generate PDF for payment
  const generatePaymentPdf = async (paiementId) => {
    try {
      const response = await cyclePaieService.genererPdfPaiement(paiementId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  };

  // Clear current data
  const clearData = () => {
    setBulletins([]);
    setCurrentCycle(null);
    setSelectedBulletin(null);
  };

  const value = {
    // State
    bulletins,
    currentCycle,
    isLoading,
    selectedBulletin,

    // Actions
    fetchBulletins,
    getBulletinById,
    downloadBulletinPdf,
    recordPayment,
    getPaymentHistory,
    getBulletinsForEmployee,
    validateBulletin,
    getBulletinDetails,
    generatePaymentPdf,
    clearData,

    // Setters
    setSelectedBulletin,
    setCurrentCycle
  };

  return (
    <BulletinPaieContext.Provider value={value}>
      {children}
    </BulletinPaieContext.Provider>
  );
};

export const useBulletinPaie = () => {
  const context = useContext(BulletinPaieContext);
  if (!context) {
    throw new Error('useBulletinPaie must be used within a BulletinPaieProvider');
  }
  return context;
};